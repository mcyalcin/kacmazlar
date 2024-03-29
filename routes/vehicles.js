var express = require('express');
var router = express.Router();
var pg = require('pg');
//noinspection JSUnresolvedVariable
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function (req, res) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('vehicles', {user: req.user});
  }
});

router.get('/api/options', function (req, res) {
  if (req.user && (req.user.role == 'admin' || req.user.role == 'ops')) {
    var options = {};
    options.typeOptions = ['ÇEKİCİ', 'DORSE', 'TANKER'];

    options.subcontractorOptions = [];
    options.licenseHolderOptions = [];
    options.c2HolderOptions = [];
    options.permissionOptions = ['YOK', 'VAR', 'İPTAL'];
    options.permissionDef = 'YOK';

    pg.connect(connectionString, function (err, client, done) {
      //language=SQL
      var subcontractorQuery = client.query('SELECT name FROM firms WHERE is_subcontractor = TRUE ORDER BY name');
      subcontractorQuery.on('row', function (row) {
        options.subcontractorOptions.push(row.name);
        if (!options.subcontractorDef) options.subcontractorDef = row.name;
      });
      subcontractorQuery.on('end', function () {
        //language=SQL
        var licenseHolderQuery = client.query('SELECT name FROM firms WHERE is_license_holder = TRUE ORDER BY name');
        licenseHolderQuery.on('row', function (row) {
          options.licenseHolderOptions.push(row.name);
          if (!options.licenseHolderDef) options.licenseHolderDef = row.name;
        });
        licenseHolderQuery.on('end', function () {
          //language=SQL
          var c2HolderQuery = client.query('SELECT name FROM firms WHERE is_c2_holder = TRUE ORDER BY name');
          c2HolderQuery.on('row', function (row) {
            options.c2HolderOptions.push(row.name);
            if (!options.c2HolderDef) options.c2HolderDef = row.name;
          });
          c2HolderQuery.on('end', function () {
            done();
            return res.json(options);
          });
        });
      });
    });
  } else {
    res.status(401);
    res.send('Unauthorized.');
  }
});

router.get('/api', function (req, res) {
  if (req.user && (req.user.role == 'admin' || req.user.role == 'ops' || req.user.role == 'observer')) {
    var results = [];
    pg.connect(connectionString, function (err, client, done) {
      //language=SQL
      var query =
        client.query(
          'SELECT \
          vehicle.id,\
          vehicle.type,\
          vehicle.license_plate, \
          subcontractor.name AS subcontractor, \
          license_holder.name AS license_holder, \
          c2_holder.name AS c2_holder,\
          vehicle.permission_status AS permission_status \
          FROM vehicles vehicle\
          LEFT JOIN firms subcontractor ON subcontractor.id = vehicle.subcontractor_firm\
          LEFT JOIN firms license_holder ON license_holder.id = vehicle.license_holder_firm\
          LEFT JOIN firms c2_holder ON c2_holder.id = vehicle.c2_holder_firm');
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        results.push(row);
      });
      query.on('end', function () {
        done();
        return res.json({data: results});
      });
      if (err) {
        console.log(err);
      }
    });
  } else {
    response.status(401);
    response.send('Unauthorized.');
  }
});

function formatLicensePlate(value) {
  var s = value.toString().replace(/ /g, '');
  if (!isNaN(parseInt(s.charAt(3)))) {
    return s.substr(0, 2) + ' ' + s.substr(2, 1).toUpperCase() + ' ' + s.substr(3);
  } else if (!isNaN(parseInt(s.charAt(4)))) {
    return s.substr(0, 2) + ' ' + s.substr(2, 2).toUpperCase() + ' ' + s.substr(4);
  } else {
    return s.substr(0, 2) + ' ' + s.substr(2, 3).toUpperCase() + ' ' + s.substr(5);
  }
}

//noinspection JSUnresolvedFunction
router.post('/api', function (req, res) {
  if (req.user && (req.user.role == 'admin' || req.user.role == 'ops')) {
    var action = req.body.action;
    if (action === 'create') {
      var data = {
        type: req.body["data[type]"],
        license_plate: formatLicensePlate(req.body["data[license_plate]"]),
        subcontractor: req.body["data[subcontractor]"],
        license_holder: req.body["data[license_holder]"],
        c2_holder: req.body["data[c2_holder]"],
        permission_status: req.body["data[permission_status]"]
      };
      pg.connect(connectionString, function (err, client, done) {
        //language=SQL
        var query = client.query(
          'INSERT INTO vehicles(type, license_plate, subcontractor_firm, license_holder_firm, c2_holder_firm, permission_status) \
             SELECT ($1), ($2), s.id, l.id, c.id, ($6) \
             FROM firms AS s, firms AS l, firms AS c \
             WHERE s.name LIKE ($3) AND l.name LIKE ($4) AND c.name LIKE ($5) \
           RETURNING *',
          [data.type, data.license_plate, data.subcontractor, data.license_holder, data.c2_holder, data.permission_status]
        );
        var result = {};
        query.on('row', function (row) {
          result = row;
        });
        query.on('end', function () {
          //language=SQL
          var select = client.query('SELECT \
            vehicle.id,\
            vehicle.type,\
            vehicle.license_plate, \
            subcontractor.name AS subcontractor, \
            license_holder.name AS license_holder, \
            c2_holder.name AS c2_holder,\
            vehicle.permission_status AS permission_status \
            FROM vehicles vehicle\
            LEFT JOIN firms subcontractor ON subcontractor.id = vehicle.subcontractor_firm\
            LEFT JOIN firms license_holder ON license_holder.id = vehicle.license_holder_firm\
            LEFT JOIN firms c2_holder ON c2_holder.id = vehicle.c2_holder_firm\
            WHERE vehicle.id=($1)', [result.id]);
          var sResult = {};
          select.on('row', function (sRow) {
            sRow.DT_RowId = sRow.id;
            sResult = sRow;
          });
          select.on('end', function () {
            done();
            return res.json(sResult);
          });
        });
        if (err) {
          console.log(err);
        }
      });
    } else if (action === 'remove') {
      var ids = req.body['id[]'];
      pg.connect(connectionString, function (err, client, done) {
        var query;
        if (typeof ids == 'string') {
          //language=SQL
          query = client.query('DELETE FROM vehicles WHERE id=($1)', [ids]);
        } else {
          //language=SQL
          query = client.query('DELETE FROM vehicles WHERE id=ANY($1::INT[])', [ids]);
        }
        query.on('end', function () {
          done();
          res.json({});
        });
        if (err) {
          console.log(err);
        }
      });
    } else if (action === 'edit') {
      var data = {
        type: req.body["data[type]"],
        license_plate: formatLicensePlate(req.body["data[license_plate]"]),
        subcontractor: req.body["data[subcontractor]"],
        license_holder: req.body["data[license_holder]"],
        c2_holder: req.body["data[c2_holder]"],
        permission_status: req.body["data[permission_status]"]
      };
      var id = req.body.id;
      pg.connect(connectionString, function (err, client, done) {
        //language=SQL
        var query = client.query('\
        UPDATE vehicles AS v\
        SET type = $1,\
        license_plate = $2,\
        subcontractor_firm = f.sid, \
        c2_holder_firm = f.cid, \
        license_holder_firm = f.lid,\
        permission_status = ($7) \
        FROM (\
          SELECT c.id AS cid, l.id AS lid, s.id AS sid\
          FROM firms AS c, firms AS l, firms AS s\
          WHERE c.name LIKE ($5) AND l.name LIKE ($4) AND s.name LIKE ($3)\
        ) f\
        WHERE v.id = ($6);',
          [data.type, data.license_plate, data.subcontractor, data.license_holder, data.c2_holder, id, data.permission_status]);
        var result = {};
        query.on('row', function (row) {
          result = row;
        });
        query.on('end', function () {
          //language=SQL
          var select = client.query('SELECT \
            vehicle.id,\
            vehicle.type,\
            vehicle.license_plate, \
            subcontractor.name AS subcontractor, \
            license_holder.name AS license_holder, \
            c2_holder.name AS c2_holder,\
            vehicle.permission_status AS permission_status\
            FROM vehicles vehicle\
            LEFT JOIN firms subcontractor ON subcontractor.id = vehicle.subcontractor_firm\
            LEFT JOIN firms license_holder ON license_holder.id = vehicle.license_holder_firm\
            LEFT JOIN firms c2_holder ON c2_holder.id = vehicle.c2_holder_firm\
            WHERE vehicle.id=($1)', [result.id]);
          var sResult = {};
          select.on('row', function (sRow) {
            sRow.DT_RowId = sRow.id;
            sResult = sRow;
          });
          select.on('end', function () {
            done();
            return res.json(sResult);
          });
        });
        if (err) {
          console.log(err);
        }
      });
    }
  } else {
    res.status(401);
    res.send('Unauthorized');
  }
});

module.exports = router;
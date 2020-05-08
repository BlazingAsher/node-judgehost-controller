var express = require('express');
var router = express.Router();

const scriptPacker = require('../services/scriptPacker');
const submissionAcceptor = require('../services/submissionAcceptor');

const Submission = require('../models/Submission');

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.json({"status": "waht r u doing here?"})
});

router.post('/judgehosts', function(req, res, next){
  return res.json([]);
})

router.get('/config', function(req, res, next){
  //console.log(req.params.name);
  if(req.query.name === "diskspace_error"){
    return res.json({
      "diskspace_error": 0
    });
  }
  if(req.query.name === "script_timelimit"){
    return res.json({
      "script_timelimit": 30
    });
  }
  if(req.query.name === "script_memory_limit"){
    return res.json({
      "script_memory_limit": 2097152
    });
  }
  if(req.query.name === "script_filesize_limit"){
    return res.json({
      "script_filesize_limit": 540672
    });
  }
  if(req.query.name === "process_limit"){
    return res.json({
      "process_limit": 64
    });
  }
  if(req.query.name === "output_storage_limit"){
    return res.json({
      "output_storage_limit": -1
    });
  }
  if(req.query.name === "timelimit_overshoot"){
    return res.json({
      "timelimit_overshoot": "1s|10%"
    });
  }
  if(req.query.name === "update_judging_seconds"){
    return res.json({
      "update_judging_seconds": 5
    });
  }
  //console.log(req.params);
  //return res.json({})

})

let submitID = Math.round(Math.random()*10000);
let cID = 170;
let teamID = 9;
let probID = 4;
let judgingID = 4;

let judged = false;

router.post('/judgehosts/next-judging/:jd', function(req, res, next){

  // if(judged){
  //   return res.json({})
  // }
  // if(!judged){
  //   judged = true;
  // }

  Submission.getNextUnjudged(function(err, result){
    if(err || !result){
      return res.json({})
    }

    return res.json({
      "submitid": result.submissionID,
      "cid": cID,
      "teamid": teamID,
      "probid": probID,
      "langid": "py3",
      "language_extensions": [
        "py",
        "py3"
      ],
      "filter_compiler_files": false,
      "rejudgingid": null,
      "entry_point": null,
      "origsubumitid": null,
      "maxruntime": 30,
      "memlimit": 2097152,
      "outputlimit": 8192,
      "run": "run",
      "compare": "compare",
      "compare_args": null,
      "compile_script": "py3",
      "combined_run_compare": false,
      "compare_md5sum": "ed319a7493a3988c0da9ae811572a7bc",
      "run_md5sum": "426edeb71885fcd67c755328b05d6875",
      "compile_script_md5sum": scriptPacker.fetchScript("py3")["md5"],
      "judgingid": result.submissionID,
      "testcases": {
        "1": {
          "md5sum_input": "b026324c6904b2a9cb4b88d6d61c81d1",
          "md5sum_output": "59ca0efa9f5633cb0371bbc0355478d8",
          "testcaseid": 1,
          "rank": 1
        }
      }
    })
  })

  //return res.end();
})

router.get('/contests/:cid/submissions/:subid/source-code', function(req, res, next){
  Submission.findOne({submissionID: req.params["subid"]}, function(err, result){
    let source = "";
    if(err || !result){
      console.log(err);
    }
    else{
      source = result.fileB64;
    }
    return res.json([{
      "id": req.params["subid"],
      "submission_id": req.params["subid"],
      "filename": "test.py",
      "source": source,
    }])
  })

})

router.put('/judgehosts/update-judging/:jd/:jid', function(req, res, next){
  console.log("received update");
  console.log(req.body);
  if(req.body && req.body["compile_success"] !== '1'){
    submissionAcceptor.deliverResult(parseInt(req.params["jid"]), req.body, function(err, result){
      if(err) {
        console.log(err);
      }
      return res.sendStatus(200).end();
    }, true);
  }
  else{
    return res.sendStatus(200).end();
  }

})

router.get('/executables/py3', function(req, res, next){
  return res.send(`"${scriptPacker.fetchScript("py3")["base64"]}"`)
  //return res.send('"UEsDBBQAAAAIAExiYk++Rw5oNQMAAM4FAAADABwAcnVuVVQJAANQrL1dUKy9XXV4CwABBOgDAAAE6AMAAG1U72/bNhD9PP4VF8VNgC6yk+2bW3crYq11EdtF7GAbuiKgqZNFVCI1kkqiFv3fd6cfibvWHwyRPL679+4dj48mO20mPhfiGN43IbfmV1C2rHSBcO9kVaGLvXK6CpBZB6f92djnp2O6skGEkMsABzG+MUE+gDQplNYhaJNZiqXoba79EJla9GBsAKlCLYuigajHjggRwdvaKTyDXR2oEB0oWhKEz7EoBow2872mjaw2KmhrQPr2Nj6gqoPcFTiF+xwNKEqB6RnoQCDtlS4ED5LRfsjbtbLOoQpUekBXOaT/ntYZndeeMAjP3muzpzWRegpMB7BgYYdQe9oJThpfSfoPxJNK1FlfCH33rFO+IMEH0k0W1iBQY6RrvlfO4b+1dug7+lXftLYIus006aujkTtrw1iIebLZzqLRRQQvSEGdBbFMlleL5eL/u68Xq8365voyof0vyWp7/fft+/VitZ3Go4uvEZvkGivrQieyCa6ByhL5M2JNlEhmw6y9vGOxcbwft5YoJCvosCpkMxXE/gPEnyEaHWSI4OMLRjUC6IcqtxAtyDlTSElVxcK2+W7bfFMYca2XV683m0hkmiu7zFF96tskBlnikhS6HRwdjX6PRPLXYnu5niez0W/iAxfRryOISfVz+AgnJ+QOYvN4JFwJcQZxDM/HVaOeshGVAxW4CXey0GlH8QhiR/hPov6IY+KcdVMoJfWsd07GpZ4e3DtlYJ4VhzJlU0fw6uSXDoTrvOgV+JPnpDc2W7MzzFQo8skrqoRtEMHLl8n6D3H8OPnH8AYNOtl6l8drGHgy5DAknZzfzIMd6h1z6nnbJEi1M7LEdvhVLs0eeYuR6NYdSQWqkL4jk9maopD5+3GnWPTP6Mv5s8nzrxEczXh1/iTZTyo9OO8ZewyEZWKSwbeU366XCfXAaZaJ85by02P5Ob1njcCH1sEcOZvwMzShaiYtAkPeGHJLyaWyxwvNk4g069zrxtY0s9zo0AGj9Jq0YI8HlKXnjKmFwtJ7Q1gp7ur9nurit7LPu15dLVbJ7bub+ZtkdgHz9bL/FILVfhzob41DzNm61Dih8tKmIH9+GDrKF6mgc/EfUEsDBAoAAAAAAExiYk/QhZX8HwAAAB8AAAAFABwAYnVpbGRVVAkAA1CsvV1QrL1ddXgLAAEE6AMAAAToAwAAIyEvYmluL3NoCiMgbm90aGluZyB0byBjb21waWxlClBLAQIeAxQAAAAIAExiYk++Rw5oNQMAAM4FAAADABgAAAAAAAEAAADtgQAAAABydW5VVAUAA1CsvV11eAsAAQToAwAABOgDAABQSwECHgMKAAAAAABMYmJP0IWV/B8AAAAfAAAABQAYAAAAAAABAAAA7YFyAwAAYnVpbGRVVAUAA1CsvV11eAsAAQToAwAABOgDAABQSwUGAAAAAAIAAgCUAAAA0AMAAAAA"')
})

router.get('/executables/run', function(req, res, next){
  //return res.send(`"${scriptPacker.fetchScript("run")["base64"]}"`)
  return res.send('"UEsDBBQAAAAIAExiYk9HaOB+JAEAAOABAAADABwAcnVuVVQJAANQrL1dUKy9XXV4CwABBOgDAAAE6AMAAE2QT0/DMAzF7/kUppu0C+vgCmVCQoC4bGh/zlPWuW2kNg6Jo+3j49CILVIUK/k9+71M7hZHYxehU2oCm2jh7LVz6Oeh9sYx1Lrv8QSNpwFmjIFrHfDgoy1DNytFs0UE7jRDFjTkYSCPYGxDAgiyD7rFJ5g+QJU6GLuEynlqKXKuvB6WZTnS/4ysD9Mj1GRZG2tsC+lpbqyLnEZfm2Ty3KEMZpIQhhEC9ZENWRDmVpKmieSNhkHbE6RNLoEBqJEwCJlKrY4IKa1Su/ft7mv1Ukwfi2eA0JmG1fdm/bne7/LleJf/8bbNuUvuPJ6Mx5pTkL8Mi6uvFXH+xmL6WgBenLgKaX5Ap71mvIefKJDY9W0c0HIoFV6wHgWVHKPBApZSZ2OF+gVQSwMECgAAAAAATGJiT9CFlfwfAAAAHwAAAAUAHABidWlsZFVUCQADUKy9XVCsvV11eAsAAQToAwAABOgDAAAjIS9iaW4vc2gKIyBub3RoaW5nIHRvIGNvbXBpbGUKUEsBAh4DFAAAAAgATGJiT0do4H4kAQAA4AEAAAMAGAAAAAAAAQAAAO2BAAAAAHJ1blVUBQADUKy9XXV4CwABBOgDAAAE6AMAAFBLAQIeAwoAAAAAAExiYk/QhZX8HwAAAB8AAAAFABgAAAAAAAEAAADtgWEBAABidWlsZFVUBQADUKy9XXV4CwABBOgDAAAE6AMAAFBLBQYAAAAAAgACAJQAAAC/AQAAAAA="')
})

router.get('/executables/compare', function(req, res, next){
  //return res.send(`"${scriptPacker.fetchScript("compare")["base64"]}"`)
  return res.send('"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"')
})

router.post('/judgehosts/internal-error', function(req, res, next){
  console.log(req.body);
  return res.send("2");
})

router.get("/testcases/:tid/file/input", function(req, res, next){
  return res.send('"MQo="');
})

router.get("/testcases/:tid/file/output", function(req, res, next){
  return res.send('"SGVsbG8gd29ybGQhCg=="');
})

router.post('/judgehosts/add-judging-run/:jd/:jid', function(req, res, next){
  //console.log(req.body);
  //console.log(req.params["jid"])
  let batchInfo = JSON.parse(req.body.batch)
  //console.log(batchInfo);
  submissionAcceptor.deliverResult(parseInt(req.params["jid"]), batchInfo[0], function(err, result){
    if(err) {
      console.log(err);
    }
    return res.end();
  });
})

module.exports = router;

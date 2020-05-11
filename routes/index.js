var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Conecta4 Original' });
});

router.get('/game', function(req, res, next){
	select = req.query.typeOfGame;
	if(select === 'informada'){
		banner = 'heuristic search'
		script = 'informada.js'
	}
	else if (select === 'noInformada'){
		banner = 'basic search'
		script = 'noInformada.js'
	}
	else{
		banner = 'min max algorithm'
		script = 'script.js'
	}
	res.render('game', {title: 'Connect4 ' + banner, script: script })
})

module.exports = router;

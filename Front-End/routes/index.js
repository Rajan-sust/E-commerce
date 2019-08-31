var cookieParser = require('cookie-parser');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('sync-request');

var fetch = require('node-fetch');

var router = express.Router();
var app = express();



app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

router.get('/', function(req, res, next) {
    res.redirect('/login');

});

router.get('/home',function (req, res, next) {


    if(req.cookies.userData == undefined){
        res.redirect('/login');
    } else{

        res.render('home', {
            id : req.cookies.userData.id,
            firstname : req.cookies.userData.firstname,
            lastname : req.cookies.userData.lastname,
            email : req.cookies.userData.email,
            accountno : req.cookies.userData.accountno,
            secret : req.cookies.userData.secret,
            flag : req.cookies.userData.flag
        });
    }
});

router.get('/login',function (req, res, next) {

    if(req.cookies.userData == undefined) {
        res.render('login');
    } else{
        res.redirect('/home');
    }
});

router.get('/logout', function (req, res) {
    res.clearCookie('userData');
    res.redirect('/login');
});

router.post('/api/login', function (req, res, next) {

    var url = 'http://127.0.0.1:10010/login';

    var data = {
        email : req.body.email,
        password : req.body.password
    };

    var fetchData = request('POST',url, {
        json: data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    fetchData = JSON.parse(JSON.parse(fetchData.getBody('utf8')));

    if(fetchData.length == 1) {
        res.cookie('userData',fetchData[0],{ maxAge: 1000 * 60 * 60 * 24 });
        res.redirect('/home');
    } else {
        res.redirect('/login?error=' + encodeURIComponent('Incorrect_Credential'));
    }

});

router.get('/register',function (req, res, next) {

    if(req.cookies.userData == undefined){
        //console.log('printing from get register');
        res.render('register');
    } else{
        res.redirect('/home');
    }
});



router.post('/api/register', function (req, res, next) {

    var url = 'http://127.0.0.1:10010/register';

    var data = {
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        email : req.body.email,
        password : req.body.password
    };

    var msg = request('POST',url, {
        json: data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    var ok = JSON.parse(msg.getBody('utf8'));

    //console.log('printing msg: ', ok);


    if(ok) {
        res.redirect('/register?status=' + encodeURIComponent('success'));
    } else{
        res.redirect('/register?status=' + encodeURIComponent('error'));
    }



});



router.post('/api/secret', function (req, res, next) {

    var url = 'http://localhost:10010/secret';

    var data = {
        accountno : req.body.accountno,
        secret : req.body.secret,
        id : req.cookies.userData.id
    };

    request('PUT',url, {
        json: data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    var id = req.cookies.userData.id;

    url = 'http://localhost:10010/user/allinfo/' + id;

    fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            let responseData = JSON.parse(jsonData);
            res.clearCookie('userData');
            res.cookie('userData',responseData,{ maxAge: 1000 * 60 * 60 * 24 });
            res.redirect('/home');

        });
});

router.post('/buy', function (req, res, next) {

    var requireTk = 0;

    if(req.body.device == 'tablet')
        requireTk = 40 * 1000;
    else if(req.body.device == 'phone')
        requireTk = 15 * 1000;
    else
        requireTk = 50 * 1000;

    var productid = 0;

    if(req.body.device == 'tablet')
        productid = 1;
    else if(req.body.device == 'phone')
        productid = 2;
    else
        productid = 3;

    var data = {
        accountno : req.cookies.userData.accountno,
        secret : req.cookies.userData.secret
    };

    var url = 'http://localhost:10020/user/amount';

    var msg = request('POST',url, {
        json: data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    var amountMsg = JSON.parse(JSON.parse(msg.getBody('utf8')));

    url = "http://localhost:10030/quantity/" + productid;

    //console.log(typeof url);

    var quantityMsg = request('GET',url,{
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

    });

    quantityMsg = JSON.parse(quantityMsg.getBody('utf8'));



    if(amountMsg.balance < requireTk) {
        res.redirect('/home?status=' + encodeURIComponent('insufficient-balance'));

    } else if(quantityMsg == 0) {
        res.redirect('/home?status=' + encodeURIComponent('not-available'));

    }else{

        var url = 'http://localhost:10020/transaction';

        data = {
            accountno : req.cookies.userData.accountno,
            secret : req.cookies.userData.secret,
            amount : requireTk * (-1)
        };

        request('PUT',url, {
            json: data,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });



        /*E-comerce credential*/
        data = {
            accountno : '000001',
            secret : '827ccb0eea8a706c4c34a16891f84e7b',
            amount : Math.floor(requireTk *2/100)
        };

        request('PUT',url, {
            json: data,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        /*Supplier Credential*/

        data = {
            accountno : '000002',
            secret : '827ccb0eea8a706c4c34a16891f84e7b',
            amount : requireTk - Math.floor(requireTk *2/100)
        };

        request('PUT',url, {
            json: data,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        url = 'http://localhost:10010/add/buy/record';

        data = {
            id : req.cookies.userData.id,
            name : req.body.device,
            price : requireTk
        };

        request('POST',url, {
            json: data,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });



        res.redirect('/home?status=' + encodeURIComponent('thanks-for-buying'));
    }



});



router.get('/home/history', function (req, res, next) {
    if(req.cookies.userData == undefined) {
        res.redirect('/login');
    } else{

        var url = 'http://localhost:10010/buy/records/' + req.cookies.userData.id;


        var histroyMsg =  request('GET',url,{
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }

        });


        histroyMsg = JSON.parse(JSON.parse(histroyMsg.getBody('utf8')));

        //console.log(histroyMsg);



        res.render('history', {
            firstname: req.cookies.userData.firstname,
            table : histroyMsg
        });
    }


});

module.exports = router;



// fetch(url, {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     }).then(response => response.json())
//         .then(jsonData => {
//            let responseData = JSON.parse(jsonData);
//            if(responseData.length==1) {
//                res.cookie('userData',responseData[0],{ maxAge: 1000 * 60 * 60 * 24 });
//                res.redirect('/home');
//            } else {
//                res.redirect('/login?error=' + encodeURIComponent('Incorrect_Credential'));
//            }
//         });
















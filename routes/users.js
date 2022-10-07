const express = require('express');
const { db } = require('../schemas/UserSchema');
const router = express.Router();
const user = require('../schemas/UserSchema');


router.get('/login', (req, res) => {
	res.render('client/login', {
		title: 'Login',
		style: 'auth.css'
	});
});

router.get('/register', (req, res) => {
	res.render('client/register', {
		title: 'Register',
		style: 'auth.css'
	});
});

// Post method for login form
router.post("/login", async(req, res) => {
	// Accessing data from body
	var email = req.body.email;
	var password = req.body.password;

	try{
		 user.findOne({$and: [{email:email}, {password:password}]})
		 .then((user) => {
			if(user != null)
			{
				res.redirect("/");
			}
			else
			{
				res.render("client/login", {
					error: "Invalid username or password", 
					title: 'Login',
					style: 'auth.css'
				});
			}
		});
	}
	catch(e) {console.log(e);}
});

// Post method for registration form
router.post("/register", async(req, res) => {
	var email = req.body.email;
	var password = req.body.password;
	var username = req.body.username;

	if(checkNullOrEmpty(email, username, password)) 
	{
		res.render("client/register", {
			error: "Please enter all fields !!",
			title: "Register",
			style: "auth.css"
		});
	}
	else if(await isUserExisting(email))
	{
		res.render("client/register", {
			error: "Email already exists !!",
			title: "Register",
			style: 'auth.css'
		});
	}
	else if(await isUserNameTaken(username))
	{
		res.render("client/register", {
			error: "Username already taken !!",
			title: "Register",
			style: 'auth.css'
		});
	}
	else 
	{
		var newUser = new user({
			email: email,
			username: username,
			password: password
		});
	
		try{
			await newUser.save()
			.then((mssg) => {
				console.log("User saved successfully !!");
				res.redirect("/");
			});
		}
		catch(e){ console.log(e);}
	}
});

// checks if form data is valid or not
function checkNullOrEmpty(mail, username, password)
{
	// check if data is null or empty
    var check1 = (mail === "" || mail === undefined);
    var check2 = (username === "" || username === undefined);
    var check3 = (password === "" || password === undefined);

	if(check1 || check2 || check3) return true;
	else return false;
	
}

// checks if email in database already exists or not
async function isUserExisting(email)
{
	return user.findOne({ email: email})
	.then((user) => {
		if(user != null) return true;
		else return false;
	});
}

// checks if username is already taken by someone or not
async function isUserNameTaken(username)
{
	return user.findOne({username: username})
	.then((user) => {
		if(user != null) return true;
		else return false;
	})
}

module.exports = router;
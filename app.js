var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');


app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set('view engine','ejs');
app.use(express.static('public'));
mongoose.connect('mongodb://localhost/blog');
app.use(methodOverride('_method'));



var blogSchema = mongoose.Schema({
	title: String,
	imageurl: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var blog = mongoose.model('Blog', blogSchema);

// ROUTES

app.get('/', function(req, res){
	res.redirect('/blogs');
});

// index route..show all blogs
app.get('/blogs', function(req, res){
	blog.find({}, function(err, blog){
		if(err){
			console.log('Error');
		} else{
			res.render('index', {blog: blog});
		}	
	})
	
});

// New post route to show form

app.get('/blogs/new', function(req, res){
	res.render('new');
});

// create route
app.post('/blogs', function(req, res){
	console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	console.log("============================");
	console.log(req.body);
	blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render('new');;
		}else{
			res.redirect('/blogs');
		}
	})
});

// Show particular blog

app.get('/blogs/:id', function(req, res){
	blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect('/blogs');
		}else{
			res.render('show', {blog: foundBlog});
		}
	});
});

// EDIT route

app.get('/blogs/:id/edit', function(req, res){
	blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log(err);
		}else{
			res.render('edit', {blog: foundBlog});
		}
	});
});

// UPDATE route
app.put('/blogs/:id', function(req, res){
	// takes 3 parameter(id, newdata, callback)
	req.body.blog.body = req.sanitize(req.body.blog.body);
	blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, UpdatedBlog){
		if(err){
			res.redirect('/blogs');
		}else{
			res.redirect('/blogs/'+ req.params.id);
		}
	});
	
});

// DELETE route

app.delete('/blogs/:id', function(req, res){
	blog.findOneAndRemove(req.params.id, function(err){
		if(err){
			res.redirect('/blogs');
		}else{
			res.redirect('/blogs');
		}
	});	
});

app.listen(3000, function(req, res){
	console.log('Blog App server has started...!!');
})
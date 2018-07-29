const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');


const app = express();
const Schema = mongoose.Schema;

// app config
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

mongoose.connect('mongodb://localhost:27017/blog_app');

// mongoose model config
var blogSchema = new Schema({
	title: String,
	image: String,
	body: String,
	created: { 
		type: Date, 
		default: Date.now
	}
});

var Blog = mongoose.model('Blog', blogSchema);

// --------RESTFUL ROUTES--------
// index ROUTE: list all "blogs"
app.get('/', (req, res) => {
	res.redirect('/blogs');
})

app.get('/blogs', (req, res) => {
	Blog.find({}, (err, blogObject) => {
		if (err) {
			console.log('Have an error');
		} else {
			res.render('index', {blogObject});
		}
	});
});
// new ROUTE: Create a new "blog", then redirect somewhere 
app.get('/blogs/new', (req, res) =>{
	res.render('new');
});
// Create ROUTE
app.post('/blogs', (req, res) => {
	console.log(req.body.blogObjForm);
	// replace an HTTP posted body property with the sanitized string
	req.body.blogObjForm.body = req.sanitize(req.body.blogObjForm.body);
	console.log(req.body.blogObjForm);
	var data = req.body.blogObjForm;
	// create a blog item
	Blog.create(data, (err, newBlogItem) => {
		if (err) {
			res.render('new');
		} else {
			// redirect to index
			res.redirect('/blogs');
		}
	});
});
// show ROUTE: show info about one specific "blog"
app.get('/blogs/:id', (req, res) => {
	// 
	var idNum = req.params.id;
	Blog.findById(idNum, (err, foundBlog) => {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('show', {foundBlog});
		}
	});
});
// edit ROUTE: show edit form for one "blog"
app.get('/blogs/:id/edit', (req, res) => {
	// 
	var idNum = req.params.id;
	Blog.findById(idNum, (err, foundBlog) => {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('edit', {foundBlog});
		}
	});
});
// update ROUTE: Update particular "blog", then redirect somewhere
app.put('/blogs/:id', (req, res) => {
	// 
	var idNum = req.params.id;
	var blogUpdated = req.body.blogObjForm;
	Blog.findByIdAndUpdate( idNum, blogUpdated, (err, updatedBlog) => {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect(`/blogs/${idNum}`);
		}
	})
});
// delete ROUTE: Delete a particular "Blog", then redirect somewhere
app.delete('/blogs/:id', (req, res) => {
	// 
	var idNum = req.params.id;
	Blog.findByIdAndRemove(idNum, (err) => {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect(`/blogs`);	
		}
	});
});

app.listen(3000, () => {
	console.log('Blog started at port 3000...');
});
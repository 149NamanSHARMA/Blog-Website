//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Event listener for connection timeout
mongoose.connection.on('timeout', () => {
  console.log('MongoDB connection timeout. Check if the MongoDB server is running.');
  process.exit(1); // Exit the application on timeout
});

// Event listener for successful connection
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Event listener for connection error
mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

let posts = [];

app.get("/", async function(req, res) {
  try {
    const posts = await Post.find({}); // Fetch all posts from the database

    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts // Pass the posts to the home page rendering
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    // Handle the error appropriately, e.g., render an error page
    res.render("home", {
      startingContent: homeStartingContent,
      posts: [] // Empty array in case of error
    });
  }
});



app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save()  // Returns a promise
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.error('Error saving post:', err);
      // Handle the error appropriately, e.g., render an error page
    });

});

app.get("/posts/:postId", async function(req, res) {
  const requestedPostId = req.params.postId;

  try {
    const post = await Post.findOne({ _id: requestedPostId }); // Find the post by _id

    if (post) {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    } else {
      // Post not found
      res.render("post", {
        title: "Post Not Found",
        content: "The requested post was not found."
      });
    }
  } catch (err) {
    console.error('Error fetching post:', err);
    // Handle the error appropriately, e.g., render an error page
    res.render("post", {
      title: "Error",
      content: "An error occurred while fetching the post."
    });
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

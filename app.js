const contact = require('./dataSchemas/contact');

require('dotenv').config();
var express                 = require("express"),
bodyParser                  = require("body-parser"),
methodOverride              = require("method-override"),
mongoose                    = require("mongoose"),
User                        = require("./dataSchemas/user"),
Contact                     = require("./dataSchemas/contact"),
sYHContact                  = require("./dataSchemas/sellYourHomeContact"),
nodeMailer                  = require('nodemailer'),
app                         = express();


//connectiong to a specific database
mongoose.connect("mongodb://localhost/AcidicSolutions", {
    useNewUrlParser: true,
    useUnifiedTopology: false,
});

//maki
app.use(methodOverride('_method'));

//setting the view engine to ejs
app.set("view engine", "ejs");

//so body-parser works
app.use(bodyParser.urlencoded({extended: true}));

//making it so express uses the public dir
app.use(express.static("public"));


const partials = {
    header: 'header.ejs',
    footer: 'footer.ejs'
  };
  app.locals.partials = partials;
//Home page
app.get("/", function(req, res){
    res.render("index", {
        currentUser: req.user,
        page_name: "index"
    });
});

//About page
app.get("/about", function(req, res){
    res.render("about", {
        page_name: "about",
        currentUser: req.user
    });
});

//contact Form
app.get("/contact", function(req, res){
    res.render("contact", {
        page_name: "contact"
    });
});

app.get("/privacy-policy", function(req, res){
    res.render("privacyPolicy", {
        page_name: "privacyPolicy"
    });
});

app.get("/terms-and-conditions", function(req, res) {
    res.render("termsAndConditions", {
        page_name: "termsAndConditions"
    });
});

app.get("/admin", function(req, res) {
    res.render("admin", {
        page_name: "admin"
    })
});

app.post("/admin", async(req, res) =>{
    if(req.body.code === process.env.ADMIN_PASSWORD) {
        User.isAdmin = true;
    } else {
        User.isAdmin = false;
    }

    if(User.isAdmin === false) {
        res.redirect("/");
    } else {
        Contact.find({})
    .populate(['name', 'propertyAddress', 'phone', 'email', 'message', 'rFContacting'])
    .then(function(contacts) {
        sYHContact.find({})
            .populate(['name', 'propertyAddress', 'phone', 'email'])
            .then(function(sYHContacts) {
                res.render("adminProfile", {
                    contact: contacts,
                    sYHContact: sYHContacts,
                    page_name: "admin"
                });
            })
            .catch(function(err) {
                console.log(err);
                return res.redirect("/");
            });
    })
    .catch(function(err) {
        console.log(err);
        return res.redirect("/");
    });



    }
});

//contact Form information
app.post("/contactform", (req, res) => {
    const data = req.body.Contact;
      
      Contact.create(data)
        .then(function(contactForm) {
          //redirecting to the home page if no errors
          res.redirect("/");
        })
        .catch(function(err) {
          console.log(err);
        });      
 });

 app.post("/SellYourHomeContact", (req, res) => {
    const data = req.body.Contact;
      
      sYHContact.create(data)
        .then(function(contactForm) {
          //redirecting to the home page if no errors
          res.redirect("/");
        })
        .catch(function(err) {
          console.log(err);
        });      
 });


app.listen(3000, function(){
    console.log("server started");
});

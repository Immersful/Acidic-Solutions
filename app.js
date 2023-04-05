if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
var express                 = require("express"),
bodyParser                  = require("body-parser"),
methodOverride              = require("method-override"),
mongoose                    = require("mongoose"),
mongoSanitize               = require("express-mongo-sanitize"),
flash                       = require('connect-flash'),
session                     = require('express-session'),
MongoStore                  = require('connect-mongo'),
ejsMate                     = require('ejs-mate'),
User                        = require("./dataSchemas/user"),
Contact                     = require("./dataSchemas/contact"),
sYHContact                  = require("./dataSchemas/sellYourHomeContact"),
nodeMailer                  = require('nodemailer'),
helmet                      = require('helmet');

const {contactSchema, sYHContactSchema} = require("./schemas");


const dbUrl = process.env.DB_URL || "mongodb://localhost/AcidicSolutions";

//connectiong to a specific database
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const app  = express();

//maki
app.use(methodOverride('_method'));

//instead of partials for headers / footer ejs-mate makes it more concise
app.engine('ejs', ejsMate);

//setting the view engine to ejs
app.set("view engine", "ejs");

//so body-parser works
app.use(bodyParser.urlencoded({extended: true}));

//To remove data, use:
app.use(mongoSanitize());

const secret = process.env.SECRET;

//storing session in mongodb
const store = MongoStore.create({
	mongoUrl: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60,
});

const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		//cookies can only be changed or configured in secured route (https)
		// secure: true,
		//making it so there session expires in 7 days so they don't just stay logged in forever
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
	returnTo: '',
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

//only allowing these urls to be used in the app... very useful but time consuming
const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net/',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net/',
];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			childSrc: ['blob:'],
		},
	})
);

//making it so express uses the public dir
app.use(express.static("public"));

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
    next()
});



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
          req.flash('success', "Submitted")
          res.redirect("/");
        })
        .catch(function(err) {
          req.flash('error', 'You cannot submit this form at this time. Sorry!');
          res.redirect("/")
        });      
 });

//contact Form information
 app.post("/SellYourHomeContact", (req, res) => {
    const data = req.body.Contact;
      sYHContact.create(data)
        .then(function(contactForm) {
          //redirecting to the home page if no errors
          req.flash('success', "Submitted")
          res.redirect("/");
        })
        .catch(function(err) {
            req.flash('error', 'You cannot submit this form at this time. Sorry!');
            res.redirect("/")
        });      
 });


 //deleting one contact form from db
app.delete("/admin/:id", async(req, res) =>{
    const {id} = req.params;
    //finding the contact info by id and removing it
   await Contact.findByIdAndRemove(id)
   res.redirect('/admin')
});

// deleting one contact from db
app.delete("/syh-admin/:id", async (req, res) => {
    const { id } = req.params;
  
    // finding the contact info by id and removing it
    await sYHContact.findByIdAndRemove(id);
  
    res.redirect("/admin");
  });
  

app.listen(3000, function(){
    console.log("server started");
});

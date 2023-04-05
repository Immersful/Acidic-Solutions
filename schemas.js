const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
	type: 'string',
	base: joi.string(),
	messages: {
		'string.escapeHTML': '{{#label}} must not include HTML!',
	},
	rules: {
		escapeHTML: {
			validate(value, helpers) {
				const clean = sanitizeHtml(value, {
					allowedTags: [],
					allowedAttributes: {},
				});
				if (clean !== value) return helpers.error('string.escapeHTML', { value });
				return clean;
			},
		},
	},
});


const Joi = BaseJoi.extend(extension);

module.exports.contactSchema = Joi.object({
    Contact: Joi.object({
        name: Joi.string().required().escapeHTML(),
        propertyAddress: Joi.string().required().escapeHTML(),
        phone: Joi.number().required().min(10).max(15),
        email: Joi.string().required().escapeHTML(),
        message: Joi.string().required().escapeHTML(),
        rFContacting: Joi.string().required().escapeHTML(),
        optIn: Joi.string().escapeHTML(),
    }).required(),
});

module.exports.sYHContactSchema = Joi.object({
    sYHContact: Joi.object({
        name: Joi.string().required().escapeHTML(),
        propertyAddress: Joi.string().required().escapeHTML(),
        phone: Joi.number().required().min(10).max(15),
        email: Joi.string().required().escapeHTML(),
        optIn: Joi.string().escapeHTML(),
    }).required(),
});



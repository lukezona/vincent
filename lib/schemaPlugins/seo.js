const Types = require('../fieldTypes');

module.exports = function seo () {
	
	const list = this;
	
	list.add(
		{ heading: 'SEO' },
		{ seo_page_title: { type: String, label: 'Page title', note: 'suggested length: 50/60 characters' } },
		{ seo_meta_description: { type: Types.Textarea, label: 'Meta description', note: 'suggested length: 50/300 characters'} },
		{ seo_page_thumbnail: { type: Types.CloudinaryImage, label: 'Page thumb', note: 'Used for social media links'} }
	);
	
}
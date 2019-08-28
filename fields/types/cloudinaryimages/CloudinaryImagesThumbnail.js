import React, { PropTypes } from 'react';
import { Button, FormInput } from '../../../admin/client/App/elemental';
import ImageThumbnail from '../../components/ImageThumbnail';

function CloudinaryImagesThumbnail ({
	isDeleted,
	imageSourceLarge,
	imageSourceSmall,
	inputName,
	isQueued,
	openLightbox,
	shouldRenderActionButton,
	toggleDelete,
	value,
  onChange,
	...props
}) {
	// render icon feedback for intent
	let mask;
	if (isQueued) mask = 'upload';
	else if (isDeleted) mask = 'remove';

	// action button
	const actionButton = (shouldRenderActionButton && !isQueued) ? (
		<Button variant="link" color={isDeleted ? 'default' : 'cancel'} block onClick={toggleDelete}>
			{isDeleted ? 'Undo' : 'Remove'}
		</Button>
	) : null;

	const input = (!isQueued && !isDeleted && value) ? (
		<input type="hidden" name={inputName} value={JSON.stringify(value)} />
	) : null;
	
	const makeChanger = (fieldPath) => {
		return fieldChanged.bind(this, fieldPath);
	};
	
	const fieldChanged = (fieldPath, event) => {
		value[fieldPath] = event.target.value;
		onChange({
			inputName,
			value: {
				...value,
				[fieldPath]: event.target.value,
			},
		});
	};

	return (
		<div className='ci-thumb'>
			<ImageThumbnail
				component={imageSourceLarge ? 'a' : 'span'}
				href={!!imageSourceLarge && imageSourceLarge}
				onClick={!!imageSourceLarge && openLightbox}
				mask={mask}
				target={!!imageSourceLarge && '__blank'}
			>
				<img src={imageSourceSmall} style={{ height: 90 }} />
			</ImageThumbnail>
			<div>
				{
					value ? (
						<FormInput
							style={{ marginTop: '1em' }}
							onChange={makeChanger('alt')}
							placeholder='alt text'
							value={value.alt || ''}
						/>
					) : null
				}
				{actionButton}
				{input}
			</div>
		</div>
	);

};

CloudinaryImagesThumbnail.propTypes = {
	imageSourceLarge: PropTypes.string,
	imageSourceSmall: PropTypes.string.isRequired,
	isDeleted: PropTypes.bool,
	isQueued: PropTypes.bool,
	openLightbox: PropTypes.func.isRequired,
	shouldRenderActionButton: PropTypes.bool,
	toggleDelete: PropTypes.func.isRequired,
};

module.exports = CloudinaryImagesThumbnail;

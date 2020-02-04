import FileChangeMessage from '../../components/FileChangeMessage';
import React, { PropTypes } from 'react';
import { Button } from '../../../admin/client/App/elemental';
import _ from 'lodash';
import ImageThumbnail from '../../components/ImageThumbnail';

const ICON_EXTS = require('../file/FileIcons');

module.exports = class SingoloFile extends React.Component {
	
	constructor (props) {
		super (props);
		
		this.state = this.buildInitialState(props);
		
		this.path = props.path;
		
		this.thumb = props.thumb;
		
		this.value = props.value;
		
		this.handleRemove = this.handleRemove.bind(this);
		this.undoRemove = this.undoRemove.bind(this);
		
	}
	
	buildInitialState (props) {
		return {
			action: null,
			removeExisting: false,
			uploadFieldPath: `File-${props.path}-`,
			userSelectedFile: null,
			isVisible: true,
		}
	}
	
	getFilename () {
		return this.state.userSelectedFile
			? this.state.userSelectedFile.name
			: this.value.filename;
	}
	
	getFileUrl () {
		return this.value && this.value.url;
	}
	
	handleRemove (e) {
		var state = {};
		
		if (this.value.isQueued) {
			this.setState({isVisible: false});
			this.value.isDeleted = false;
			this.value.isQueued = false;
			return this.props.onDeleteQueued(this.value.filename);
		} else if (this.state.userSelectedFile) {
			state = this.buildInitialState(this.props);
		} else if (this.hasExisting()) {
			state.removeExisting = true;
			this.value.isDeleted = true;
			if (this.props.autoCleanup) {
				if (e.altKey) {
					state.action = 'reset';
				} else {
					state.action = 'delete';
				}
			} else {
				if (e.altKey) {
					state.action = 'delete';
				} else {
					state.action = 'reset';
				}
			}
		}
		
		this.setState(state);
		this.props.onChange();
	}
	
	undoRemove () {
		this.value.isDeleted = false;
		this.setState(this.buildInitialState(this.props));
		this.props.onChange();
	}
	
	hasExisting () {
		return this.value && !!this.value.filename;
	}
	
	hasFile () {
		return this.hasExisting(this.value) || !!this.state.userSelectedFile;
	}
	
	isImage () {
		const href = this.value ? this.value.url : undefined;
		return href && href.match(/\.(jpeg|jpg|gif|png|svg)$/i) != null;
	}
	
	renderChangeMessage () {
		if (this.state.userSelectedFile) {
			return (
				<FileChangeMessage color="success">
					Save to Upload
				</FileChangeMessage>
			);
		} else if (this.state.removeExisting) {
			return (
				<FileChangeMessage color="danger">
					File {this.props.autoCleanup ? 'deleted' : 'removed'} - save to confirm
				</FileChangeMessage>
			);
		} else {
			return null;
		}
	}
	
	renderClearButton () {
		if (this.state.removeExisting) {
			return (
				<Button variant="link" onClick={this.undoRemove}>
					Undo Remove
				</Button>
			);
		} else {
			var clearText;
			if (this.value.isQueued) {
				clearText = 'Cancel Upload';
			} else {
				clearText = (this.props.autoCleanup ? 'Delete File' : 'Remove File');
			}
			return (
				<div>
					<Button variant="link" color="cancel" onClick={this.handleRemove}>
						{clearText}
					</Button>
					{ !this.value.isQueued ?
						(<input type="hidden" name={this.path} value={JSON.stringify(this.value)} />)
						: null
					}
				</div>
			);
		}
	}
	
	renderActionInput () {
		// If the user has selected a file for uploading, we need to point at
		// the upload field. If the file is being deleted, we submit that.
		if (this.state.userSelectedFile || this.state.action) {
			const value = this.state.userSelectedFile
				? `upload:${this.state.uploadFieldPath}`
				: (this.state.action === 'delete' ? 'remove' : '');
			return (
				<input
					name={this.getInputName(this.props.path)}
					type="hidden"
					value={value}
				/>
			);
		} else {
			return null;
		}
	}
	
	renderFileNameAndChangeMessage () {
		
		const href = this.value ? this.value.url : undefined;
		const ext = this.value.filename.split('.').pop();
		
		let iconName = '_blank';
		if (_.includes(ICON_EXTS, ext)) iconName = ext;
		
		return (
			<div>
				{(this.hasFile() && !this.state.removeExisting) ? (
					<FileChangeMessage component={href ? 'a' : 'span'} href={href} target="_blank">
						<img key="file-type-icon" className="file-icon" src={Keystone.adminPath + '/images/icons/32/' + iconName + '.png'} />
						{this.getFilename()}
					</FileChangeMessage>
				) : null}
				{this.renderChangeMessage()}
			</div>
		);
	}
	
	
	renderImagePreview () {
		const imageSource = this.getFileUrl();
		return (
			<ImageThumbnail
				component="a"
				href={imageSource}
				target="__blank"
				style={{marginRight: '1em', maxWidth: '50%' }}
			>
				<img src={imageSource} style={{ 'max-height': 100, 'max-width': '100%' }} />
			</ImageThumbnail>
		);
	}
	
	render () {
		return (
			
			<div className='file-wrapper'>
				{this.hasFile() && this.renderFileNameAndChangeMessage()}
				{this.isImage() && this.thumb && this.renderImagePreview()}
				{this.hasFile() && this.renderClearButton()}
			</div>
		)
	}
	
}

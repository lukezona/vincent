/**
 TODO:
 - Format size of stored file (if present) using bytes package?
 - Display file type icon? (see LocalFileField)
 */

import Field from '../Field';
import React, { PropTypes } from 'react';
import {
	Button,
	Container,
	FormField,
	FormInput,
	FormNote,
} from '../../../admin/client/App/elemental';
import FileChangeMessage from '../../components/FileChangeMessage';
import HiddenFileInput from '../../components/HiddenFileInput';
import ImageThumbnail from '../../components/ImageThumbnail';
import SingoloFile from './FilesList';
import _ from 'lodash';

let uploadInc = 1000;

const buildInitialState = (props) => ({
	action: null,
	removeExisting: false,
	uploadFieldPath: `File-${props.path}-${++uploadInc}`,
	userSelectedFile: null,
});

module.exports = Field.create({
	propTypes: {
		autoCleanup: PropTypes.bool,
		collapse: PropTypes.bool,
		label: PropTypes.string,
		note: PropTypes.string,
		path: PropTypes.string.isRequired,
		thumb: PropTypes.bool,
		value: PropTypes.shape({
			filename: PropTypes.string,
			// TODO: these are present but not used in the UI,
			//       should we start using them?
			// filetype: PropTypes.string,
			// originalname: PropTypes.string,
			// path: PropTypes.string,
			// size: PropTypes.number,
		}),
	},
	statics: {
		type: 'File',
		getDefaultValue: () => ({}),
	},
	buildInitialState (props) {
		
		const uploadFieldPath = `Files-${props.path}-${++uploadInc}`;
		const elementi = props.value ? props.value.map((val, index) => {
			
			return (<SingoloFile
				autoCleanup={props.autoCleanup}
				path={props.path}
				thumb={props.thumb}
				value={val}
				index={index}
				onChange={this.changeMessage}
				onDeleteQueued={this.remove_from_upload_list}
			/>)
			
		}) : [];
		
		return {
			action: null,
			removeExisting: false,
			uploadFieldPath: uploadFieldPath,
			userSelectedFile: null,
			elementi: elementi,
			operationMessage: this.changeMessage(),
			updateFiles: false,
		}
	},
	getInitialState () {
		return this.buildInitialState(this.props);
	},
	shouldCollapse () {
		return this.props.collapse && !this.hasExisting();
	},
	componentWillUpdate (nextProps) {
		// Show the new filename when it's finished uploading
		if (this.props.value.length !== nextProps.value.length) {
			this.setState({elementi: []}, () => this.setState(this.buildInitialState(nextProps)))
		}
	},
	
	// ==============================
	// HELPERS
	// ==============================
	
	hasFile (value) {
		if (!this.state) return false;
		return this.hasExisting(value) || !!this.state.userSelectedFile;
	},
	hasExisting (value) {
		return value && !!value.filename;
	},
	getFilename (value) {
		return this.state.userSelectedFile
			? this.state.userSelectedFile.name
			: value.filename;
	},
	getFileUrl (value) {
		return value && value.url;
	},
	isImage (value) {
		const href = value ? value.url : undefined;
		return href && href.match(/\.(jpeg|jpg|gif|png|svg)$/i) != null;
	},
	
	// ==============================
	// METHODS
	// ==============================
	getCount () {
		var uploadCount = 0;
		var deleteCount = 0;
		if (!this.state) return {uploadCount, deleteCount};
		this.state.elementi.forEach((elemento) => {
			
			if (elemento) {
				if (elemento.props.value.isDeleted && elemento.props.value.isQueued) {
				
				} else if (elemento.props.value.isDeleted) {
					deleteCount++;
				} else if (elemento.props.value.isQueued) {
					uploadCount++;
				}
			}
			
		});
		
		return {uploadCount, deleteCount};
	},
	triggerFileBrowser () {
		this.refs.fileInput.clickDomNode();
	},
	remove_from_upload_list (name) {
		this.setState({updateFiles: true}, () => this.update_upload_list(name));
	},
	update_upload_list (name) {
		
		const upload = document.querySelector(`[name="${this.state.uploadFieldPath}"]`);
		const dl = new DataTransfer();
		
		Array.from(upload.files).filter(u => u.name !== name).forEach(u=> dl.items.add(u));
		upload.files = dl.files;
		
		if (!dl.items.length) {
			this.setState({userSelectedFile: null})
		}
		
		const elementi = [...this.state.elementi];
		const new_elementi = elementi.filter(e => e.props.value.filename !== name).map(e => {
			return (<SingoloFile
				autoCleanup={e.props.autoCleanup}
				path={e.props.path}
				thumb={e.props.thumb}
				value={e.props.value}
				index={e.props.index || null}
				onChange={e.props.onChange || null}
				onDeleteQueued={e.props.onDeleteQueued || null}
			/>)
		});
		this.setState(()=> {return {elementi: []}}, () => {this.setState({elementi: new_elementi})});
		
	},
	handleFileChange (event) {
		
		if (this.state.updateFiles === false) {
			const userSelectedFile = event.target.files[0];
			const files = Array.prototype.map.call(event.target.files, (f, index) => {
				return (<SingoloFile
					autoCleanup={this.props.autoCleanup}
					path={this.props.path}
					thumb={this.props.thumb}
					onChange={this.changeMessage}
					onDeleteQueued={this.remove_from_upload_list}
					value={{
						filename: f.name,
						size: f.size,
						mimetype: f.type,
						originalname: f.name,
						isQueued: true,
					}}
					index={index}
				/>)
			});
			
			this.setState({
				userSelectedFile: userSelectedFile,
				elementi: [...this.state.elementi, ...files]
			}, () => this.changeMessage());
		} else {
			this.changeMessage();
			this.setState({updateFiles: false});
		}
		
	},
	handleRemove (e) {
		var state = {};
		
		if (this.state.userSelectedFile) {
			state = this.buildInitialState(this.props);
		} else if (this.hasExisting(this.props.value[0])) {
			state.removeExisting = true;
			
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
	},
	undoRemove () {
		this.setState(this.buildInitialState(this.props));
	},
	
	// ==============================
	// RENDERERS
	// ==============================
	
	renderFileNameAndChangeMessage (valore) {
		if (!this.state) {
			return;
		}
		const href = valore ? valore.url : undefined;
		return (
			<div>
				{(this.hasFile(valore) && !this.state.removeExisting) ? (
					<FileChangeMessage component={href ? 'a' : 'span'} href={href} target="_blank">
						{this.getFilename(valore)}
					</FileChangeMessage>
				) : null}
				{this.renderChangeMessage()}
			</div>
		);
	},
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
	},
	renderClearButton () {
		if (this.state.removeExisting) {
			return (
				<Button variant="link" onClick={this.undoRemove}>
					Undo Remove
				</Button>
			);
		} else {
			var clearText;
			if (this.state.userSelectedFile) {
				clearText = 'Cancel Upload';
			} else {
				clearText = (this.props.autoCleanup ? 'Delete File' : 'Remove File');
			}
			return (
				<Button variant="link" color="cancel" onClick={this.handleRemove} style={{paddingRight: 0}}>
					{clearText}
				</Button>
			);
		}
	},
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
	},
	renderImagePreview (valore) {
		const imageSource = this.getFileUrl(valore);
		return (
			<ImageThumbnail
				component="a"
				href={imageSource}
				target="__blank"
				style={{ float: 'left', marginRight: '1em', maxWidth: '50%' }}
			>
				<img src={imageSource} style={{ 'max-height': 100, 'max-width': '100%' }} />
			</ImageThumbnail>
		);
	},
	changeMessage (msg) {
		
		const hasFile = this.hasFile(null);
		
		const {uploadCount, deleteCount} = this.getCount();
		// prepare the change message
		const changeMessage = uploadCount || deleteCount ? (
			<FileChangeMessage>
				{uploadCount && deleteCount ? `${uploadCount} added and ${deleteCount} removed` : null}
				{uploadCount && !deleteCount ? `${uploadCount} file added` : null}
				{!uploadCount && deleteCount ? `${deleteCount} file removed` : null}
			</FileChangeMessage>
		) : null;
		
		// prepare the save message
		const saveMessage = uploadCount || deleteCount ? (
			<FileChangeMessage color={!deleteCount ? 'success' : 'danger'}>
				Save to {!deleteCount ? 'Upload' : 'Confirm'}
			</FileChangeMessage>
		) : null;
		
		
		const operationMessage = (
			<div style={{paddingLeft: '1em'}}>
				{changeMessage}
				{saveMessage}
			</div>);
		
		this.setState({operationMessage: operationMessage})
	},
	renderUI () {
		const { label, note, path, thumb } = this.props;
		const valore = null;
		const isImage = this.isImage(valore);
		const hasFile = this.hasFile(valore);
		
		return (
			<div data-field-name={path} data-field-type="files">
				<FormField label={label} htmlFor={path}>
					{this.shouldRenderField() ? (
						<div>
							{this.state.elementi}
							<div style={{ marginTop: '1em', display: 'flex', alignItems: 'center' }}>
								<Button onClick={this.triggerFileBrowser}>
									{hasFile ? 'Change' : 'Upload'} File
								</Button>
								{hasFile && this.renderClearButton()}
								{this.state.operationMessage}
							</div>
							<HiddenFileInput
								key={this.state.uploadFieldPath}
								name={this.state.uploadFieldPath}
								multiple
								onChange={this.handleFileChange}
								ref="fileInput"
							/>
							{this.renderActionInput()}
						</div>
					) : (
						<div>
							{hasFile
								? this.renderFileNameAndChangeMessage(valore)
								: <FormInput noedit>no file</FormInput>}
						</div>
					)}
					{!!note && <FormNote html={note} />}
				</FormField>
			</div>
		);
	},
	
});

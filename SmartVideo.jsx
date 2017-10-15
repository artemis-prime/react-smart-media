var React 	= require('react');
var $ 		= require('jquery');

var m 					= require('@artemis-prime/math-utils');
var logger				= require('@artemis-prime/logger');

class SmartVideo extends React.Component {

	constructor(props) {
		super(props);
			// If an id was supplied, use that, otherwise generate one.
			// Needed for javascript DOM access.
		this.id = (props.id) ? props.id : "video-" + m.hash();
		this.state = {
			width: "auto",
			height: "auto"
		};
	}

	componentDidMount() {

			// could not get the React ref mechanism to work reliably.
		this.$e = $("#" + this.id);
		this.elem = this.$e.get(0);

		if (this.props.playOnClick) {
			this.$e.click(() => {
				if (this.elem.paused) {
					this.elem.play();
				}
				else {
					this.elem.pause();
				}
			});
		}
		this.elem.addEventListener('ended', () => {
			this.elem.load();	// reloads the poster image
		});

		this.loadVideo(this.props);
	}

	componentWillReceiveProps(props) {
		this.loadVideo(props);
	}

	loadVideo(props) {
		let eventsFired = 0;
		let _this = this;

			// cf: https://stackoverflow.com/questions/36883037/generate-a-thumbnail-snapshot-of-a-video-file-selected-by-a-file-input-at-a-spec
			// keep as function (NOT FAT ARROW)
		this.$e.one('loadedmetadata loadeddata suspend', function() {
			if (++eventsFired == 3) {
				_this.natural = {
					w: this.videoWidth,
					h: this.videoHeight,
					ar: this.videoWidth / this.videoHeight
				};
				logger.log("VIDEO natural sizing " + JSON.stringify(_this.natural));
				_this.adjustVideoDimensions(props);
			}
		}).prop('src', this.props.videoSrc);
	}

	adjustVideoDimensions(props) {
		if (!props.scaling) {
			console.error("SmartVideo.adjustImageDimensions() -- ERROR: Must supply a scaling request!");
			return;
		}

		if(props.scaling == "adjust-width") {
			let newWidth = Math.round(this.natural.ar * this.$e.height());  // this is the rendered height();
			logger.log("SmartVideo -- adjusted width: " + newWidth);
			this.setState({
				width: newWidth,
				height: "auto"
			});
		}
		else if(props.scaling == "adjust-height") {
			let newHeight = Math.round(this.$e.width() / this.natural.ar);  // this is the rendered width();
			logger.log("SmartVideo -- adjusted height: " + newHeight);
			this.setState({
				width: "auto",
				height: newHeight
			});
		}
		else if(props.scaling == "adjust-within") {
				// This display param is the *Bounds* that we must fit within
			let display = {
				w:  parseInt(props.width),
				h: 	parseInt(props.height),
				ar: parseInt(props.width) / parseInt(props.height)
			};

			if (this.natural.ar >= display.ar) {
				let newHeight = Math.round(display.w / this.natural.ar);
				logger.log("SmartVideo -- 'adjust-within' -- new height: " + newHeight);
				this.setState({
					width: display.w,
					height: newHeight
				});
			}
			else {
				let newWidth = Math.round(display.h * this.natural.ar);
				logger.log("SmartImage -- 'adjust-within' -- new width: " + newWidth);
				this.setState({
					width: newWidth,
					height: display.h
				});
			}
		}
	}

	render() {

			// allow for all the properties the calling code wants,
			// such as "controls" or "autoPlay" (note the capital "P"!)
		const {
			id,
			className,
			imageSrc,
			videoSrc,
			width,
			height,
			scaling,
			fullScreen,
			playOnClick,
			onClick,

			...rest

		} = this.props;

		let style = {
			width: this.state.width,
			height: this.state.height
		}

			// if we have a wrapper, save it for that.
		let videoTagClassName = (this.props.noWrapper) ? className : '';
		let videoMarkup =
			<video
				id={this.id}
				className={videoTagClassName}
				poster={imageSrc}
				style={style}
				onClick={this.props.onClick}
				{...rest}
			/>
		; ///

		if (this.props.noWrapper) {
			return videoMarkup;
		}

		return (
			<div className={"video-outer " + className} style={style}>
				{videoMarkup}
				{this.props.children}
			</div>
		);
	}
}

module.exports = SmartVideo;

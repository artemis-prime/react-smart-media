var React 				= require('react');
var $ 					= require('jquery');

var m 					= require('@artemis-prime/math-utils');
var logger				= require('@artemis-prime/logger');

class SmartImage extends React.Component {

	constructor(props) {
		super(props);

			// If an id was supplied, use that, otherwise generate one.
			// Needed for javascript DOM access.
		this.id = (props.id) ? props.id : "image-" + m.hash();
		this.state = {
			width: "auto",
			height: "auto",
		};
		logger.log(this.id);
	}

	componentDidMount() {
		this.loadImage(this.props);
	}

	componentWillReceiveProps(props) {
		this.loadImage(props);
	}

	loadImage(props) {
		let img = new Image();
		img.onload = () => {
			this.natural = {
				w: img.width,
				h: img.height,
				ar: (img.width / img.height)
			};
			logger.log("SmartImage.loadImage() -- image loaded.  Natural dim: " + JSON.stringify(this.natural));
			this.adjustImageDimensions(props);
		};
		img.onerror = function() {
			console.error("SmartImage.loadImage() -- ERROR loading image!");
		}
		img.src = props.imageSrc;
	}

	adjustImageDimensions(props) {
		if (!props.scaling) {
			console.error("SmartImage.adjustImageDimensions() -- ERROR: Must supply a scaling request!");
			return;
		}

		let $img = $("#" + this.id);
		let domImg = $img[0];

		if(props.scaling == "adjust-width") {
			let newWidth = Math.round(this.natural.ar * $img.height());  // this is the rendered height();
			logger.log("SmartImage -- adjusted width: " + newWidth);
			this.setState({
				height: "auto",
				width: newWidth
			});
		}
		else if(props.scaling == "adjust-height") {
			let newHeight = Math.round($img.width() / this.natural.ar);  // this is the rendered width();
			logger.log("SmartImage -- adjusted height: " + newHeight);
			this.setState({
				height: newHeight,
				width: "auto"
			});
		}
		else if(props.scaling == "adjust-within") {
			let display = {
				w:  parseInt(props.width),
				h: 	parseInt(props.height),
				ar: parseInt(props.width) / parseInt(props.height)
			};

			if (this.natural.ar >= display.ar) {
				let newHeight = Math.round(display.w / this.natural.ar);
				logger.log("SmartImage -- adjust within -- new height: " + newHeight);
				this.setState({
					width: display.w,
					height: newHeight
				});
			}
			else {
				let newWidth = Math.round(display.h * this.natural.ar);
				logger.log("SmartImage -- adjust within -- new width: " + newWidth);
				this.setState({
					width: newWidth,
					height: display.h
				});
			}
		}
	}

	render() {

		let style = {
			width: this.state.width,
			height: this.state.height
		}

		// if we have a wrapper, save it for that.
		let imgTagClassName = (this.props.noWrapper) ? this.props.className : '';

		let imgMarkup =
			<img
				id={this.id}
				className={imgTagClassName}
				src={this.props.imageSrc}
				style={style}
				onClick={this.props.onClick}
			/>
		; ///

		if (this.props.noWrapper) {
			return imgMarkup;
		}

		return (
			<div className={"img-outer " + this.props.className} style={style}>
				{imgMarkup}
				{this.props.children}
			</div>
		)
	}
}

module.exports = SmartImage;

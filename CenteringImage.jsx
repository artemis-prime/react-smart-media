var React 		= require('react');
var $ 			= require('jquery');

var m 					= require('@artemis-prime/math-utils');
var logger				= require('@artemis-prime/logger');

class CenteringImage extends React.Component {

	constructor(props) {
		super(props);

			// If an id was supplied, use that, otherwise generate one.
			// Needed for javascript DOM access.
		this.id = (props.id) ? props.id : "image-" + m.hash();
		this.state = {
			natural: null
		};
	}

	componentDidMount() {
		this.queryImage(this.props);
	}

	componentWillReceiveProps(props) {
		this.queryImage(props);
	}

	queryImage(props) {
		if (!props.adjust) {
			console.error("CenteringImage.componentDidMount() -- ERROR: Must supply a 'adjust' parameter!");
			this.setState({natural: null});
			return;
		}
		else if (!(props.imageSrc && props.imageSrc.trim())) {
			this.setState({natural: null});
			logger.log("CenteringImage.componentDidMount() -- no image url supplied.  Moving on...");
			return;
		}

		let img = new Image();
		img.onload = () => {
			this.setState({
				natural: {
					w: img.width,
					h: img.height,
					ar: img.width / img.height
				}
			});
		};
		img.onerror = () => {
			this.setState({natural: null});
			console.error("CenteringImage.componentDidMount() -- ERROR loading bg image url: " + props.imageSrc);
		}
			// Aaaand... we're off!
		img.src = props.imageSrc;
	}

	getWidthPercentage(dim) {
		if (!(this.props.adjust && this.props.adjust.includes("width") && this.state.natural)) {
			return 100;
		}
		if (dim.ar >= this.state.natural.ar) {
			return 100;
		}
		let newWidth = dim.h * this.state.natural.ar;
		return Math.round((newWidth / dim.w) * 100);
	}

	getHeightPercentage(dim) {
		if (!(this.props.adjust && this.props.adjust.includes("height") && this.state.natural)) {
			return 100;
		}
		if (dim.ar <= this.state.natural.ar) {
			return 100;
		}
		let newHeight = dim.w / this.state.natural.ar;
		return Math.round((newHeight / dim.h) * 100);
	}

	getHeightPositionPercentage(dim) {
		if (!(this.props.adjust && this.props.adjust.includes("height") && this.state.natural)) {
			return 50;
		}
			// if we're really tall, use the upper part of the image
		let aspectHeight = dim.w / this.state.natural.ar;
		logger.log("CenteringImage -- Aspect height: " + aspectHeight);

		let availableHeightRatio = (dim.h / aspectHeight);
		logger.log("CenteringImage -- availableHeightRatio: " + availableHeightRatio);

		let result = 50;
		if (availableHeightRatio <= .3) {
			result = 10;
		}
		else if (availableHeightRatio >= .8) {
			// DO NOTHING result = 50;
		}
		else {
			result = 10 + (50 - 10) * (availableHeightRatio - 0.3) / (0.8 - 0.3);
		}
		logger.log("CenteringImage -- percent height position: " + result);
		return result;
	}

	render() {
			// This is meant to be assigned in css, so we have to determine it by query
		let img = $("#" + this.id);
		let renderedDim = {
			w: img.width(),
			h: img.height(),
			ar: img.width() / img.height()
		};

		let bgImageStyle = (this.props.imageSrc && this.props.imageSrc.trim()) ?
			"url('" + this.props.imageSrc + "')"
			:
			"none"
		; ///

		let style = {
			backgroundImage: bgImageStyle,
			backgroundSize: this.getWidthPercentage(renderedDim) + "% " + this.getHeightPercentage(renderedDim) + "%",
			backgroundPosition: "50% " + this.getHeightPositionPercentage(renderedDim) + "%",
			backgroundRepeat: 'no-repeat',
		};

		return (
			<div id={this.id} className={this.props.className} style={style} />
		);
	}
}

module.exports = CenteringImage;

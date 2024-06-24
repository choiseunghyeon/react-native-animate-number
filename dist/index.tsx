import React, { Component } from 'react';
import {
  StyleProp,
  Text,
  ViewStyle
} from 'react-native';
import Timer from 'react-timer-mixin';

const HALF_RAD = Math.PI/2

export default class AnimateNumber extends Component {

  props: {
    // Text Component의 최대 폰트 크기 배율 설정
    maxFontSizeMultiplier?: number | null | undefined,
    countBy?: number,
    interval?: number,
    steps?: number,
    value: number,
    defaultValue: number,
    timing: 'linear' | 'easeOut' | 'easeIn' | ((interval: number, progress: number) => number),
    formatter: (format: number) => number,
    onProgress?: (value: number, total: number) => {},
    onFinish: (total:number, displayValue: number) => {}
    style: StyleProp<ViewStyle>
  };

  static defaultProps = {
    interval: 14,
    timing: 'linear',
    steps: 45,
    // value: 0,
    formatter: (val: number) => val,
    onFinish: () => {}
  };

  static TimingFunctions = {

    linear: (interval:number, progress:number):number => {
      return interval
    },

    easeOut: (interval:number, progress:number):number => {
      return interval * Math.sin(HALF_RAD*progress) * 5
    },

    easeIn: (interval:number, progress:number):number => {
      return interval * Math.sin((HALF_RAD - HALF_RAD*progress)) * 5
    },

  };

  state: {
    value?: number,
    displayValue?: number
  };

  /**
   * Animation direction, true means positive, false means negative.
   * @type {bool}
   */
  direction: boolean;
  /**
   * Start value of last animation.
   * @type {number}
   */
  startFrom: number;
  /**
  * End value of last animation.
  * @type {number}
   */
  endWith: number;

  dirty: boolean;

  timerId: string;

  constructor(props:any) {
    super(props);
    // default values of state and non-state variables
    this.state = {
      value: props.value,
      displayValue: props.value
    }
    this.dirty = false;
    this.startFrom = props.value;
    this.endWith = props.value;
  }

  componentDidMount() {
    this.startFrom = this.state.value
    this.endWith = this.props.value
    this.dirty = true
    this.startAnimate()
  }

  componentWillUpdate(nextProps, nextState) {

    // check if start an animation
    if(this.props.value !== nextProps.value) {
      this.startFrom = this.props.value
      this.endWith = nextProps.value
      this.dirty = true
      this.startAnimate()
      return
    }
    // Check if iterate animation frame
    if(!this.dirty) {
      return
    }
    if (this.direction === true) {
      if(this.state.value <= this.props.value) {
        this.startAnimate();
      }
    }
    else if(this.direction === false){
      if (this.state.value >= this.props.value) {
        this.startAnimate();
      }
    }
  }
    
  componentWillUnmount() {
    Timer.clearTimeout(this.timerId)
  }

  startAnimate() {

    let progress = this.getAnimationProgress()

    this.timerId = Timer.setTimeout(() => {

      let value = (this.endWith - this.startFrom)/this.props.steps
      if(this.props.countBy)
        value = Math.sign(value)*Math.abs(this.props.countBy)
      let total = this.state.value + value

      this.direction = (value > 0)
      // animation terminate conditions
      if (((this.direction) !== (total <= this.endWith))) {
        this.dirty = false
        total = this.endWith
        this.props.onFinish(total, this.props.formatter(total))
      }

      if(this.props.onProgress)
        this.props.onProgress(this.state.value, total)

      this.setState({
        value: total,
        displayValue: this.props.formatter(total)
      })

    }, this.getTimingFunction(this.props.interval, progress))    
  }

  getAnimationProgress():number {
    return (this.state.value - this.startFrom) / (this.endWith - this.startFrom)
  }

  getTimingFunction(interval:number, progress:number) {
    if(typeof this.props.timing === 'string') {
      let fn = AnimateNumber.TimingFunctions[this.props.timing]
      return fn(interval, progress)
    } else if(typeof this.props.timing === 'function')
      return this.props.timing(interval, progress)
    else
      return AnimateNumber.TimingFunctions['linear'](interval, progress)
  }

  render() {
    return (
      <Text {...this.props}>
        {' ' + this.state.displayValue}
      </Text>
    )
  }
}

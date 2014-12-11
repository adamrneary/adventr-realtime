/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');

// https://github.com/facebook/react-devtools
window.React = React;

var firebaseApp = "https://luminous-heat-2841.firebaseio.com/";

var ViewCount = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {data: 0};
  },

  componentWillMount: function() {
    this.bindAsObject(new Firebase(firebaseApp + "testObject"), "data");
  },

  render: function() {
    return (
      <div id="viewCount">
        <OdometerComponent value={this.state.data} />
      </div>
    );
  }
});

var OdometerComponent = React.createClass({
  componentDidMount: function(){
     this.odometer = new Odometer({
      el: this.getDOMNode(),
      value: this.props.value
    });
  },
  componentDidUpdate: function() {
   this.odometer.update(this.props.value)
  },
  render: function() {
    return React.DOM.div()
  }
})

React.renderComponent(
  <ViewCount />,
  document.getElementById('content')
);

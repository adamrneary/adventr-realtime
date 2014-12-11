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
var projectId = location.hash.substring(1);

var ViewCount = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {data: 0};
  },

  componentWillMount: function() {
    var firebaseLocation = firebaseApp + 'project/' + projectId;
    this.bindAsObject(new Firebase(firebaseLocation), "data");
  },

  render: function() {
    return (
      <div id="viewCount">
        <h3>{this.state.data.name}</h3>
        <OdometerComponent value={this.state.data.viewCount} />
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
  <ViewCount projectId={projectId}/>,
  document.getElementById('content')
);

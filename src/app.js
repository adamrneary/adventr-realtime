var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var OdometerComponent = require('./react-odometer-component')

// https://github.com/facebook/react-devtools
window.React = React;

var firebaseApp = "https://luminous-heat-2841.firebaseio.com/";
var projectId = location.hash.substring(1);
if (projectId === '') projectId = 14;

var ViewCount = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {data: {name: '…loading…', events: {'Video View': 10000}}};
  },

  componentWillMount: function() {
    var firebaseLocation = firebaseApp + 'project/' + projectId;
    this.bindAsObject(new Firebase(firebaseLocation), "data");
  },

  render: function() {
    return (
      React.DOM.div({id: "viewCount"}, [
        React.DOM.h3(null, this.state.data.name),
        React.createElement(OdometerComponent, {value: this.state.data.events['Video View']})
      ])
    );
  }
});

React.renderComponent(
  React.createElement(ViewCount, {projectId: projectId}),
  document.getElementById('content')
);

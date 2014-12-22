React = require('react')
Firebase = require('firebase')
ReactFireMixin = require('reactfire')
OdometerComponent = require('react-odometer')

firebaseApp = 'https://luminous-heat-2841.firebaseio.com/'
projectId = location.hash.substring(1) or 14
ViewCount = React.createClass
  mixins: [ReactFireMixin]
  getInitialState: ->
    data:
      name: '…loading…'
      events: {'Video View': 10000}

  componentWillMount: ->
    @bindAsObject new Firebase("#{firebaseApp}project/#{projectId}"), 'data'

  render: ->
    React.DOM.div {id: 'viewCount'},
      React.DOM.h3(null, @state.data.name),
      React.createElement OdometerComponent,
        value: @state.data.events['Video View']

React.renderComponent React.createElement(ViewCount, {projectId: projectId} ),
  document.getElementById('content')

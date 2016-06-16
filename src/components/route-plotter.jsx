import React from 'react'

import MapRenderer from './map-renderer'
import CoordinatesList from './coordinates-list'
import PathResult from './path-result'

/*
[
  [1.3542636, 103.9413607],
  [1.2996761, 103.7871946]
]
*/

export default class RoutePlotter extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      input: null,
      points: null,
      polyline: null
    }
  }

  setRenderer (map) {
    const renderer = new google.maps.DirectionsRenderer({map, draggable: true})
    renderer.directions_changed = () => {
      const directions = renderer.getDirections()
      console.log(directions)
      const {overview_path, overview_polyline} = directions.routes[0]
      this.setState({
        points: overview_path.map((point) => [point.lat(), point.lng()]),
        polyline: overview_polyline
      })
    }
    this.directionsRenderer = renderer
  }

  updateCoordinates (val) {
    const inputData = JSON.parse(val)
    this.setState({input: inputData})

    const directionsService = new google.maps.DirectionsService()
    const inputLatLng = inputData.map((coordinates) => new google.maps.LatLng(...coordinates))
    const request = {
      origin: inputLatLng[0],
      destination: inputLatLng[inputLatLng.length - 1],
      waypoints: inputLatLng.slice(1, -1).map((latLng) => ({location: latLng})),
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false
    }

    directionsService.route(request, (result, status) => {
      if (status !== google.maps.DirectionsStatus.OK) return
      if (this.directionsRenderer) {
        this.directionsRenderer.setDirections(result)
      }
    })
  }

  render () {
    return (
      <div>
        <MapRenderer
          onMount={this.setRenderer.bind(this)}/>
        <CoordinatesList
          onUpdate={this.updateCoordinates.bind(this)} />
        {this.state.points && this.state.polyline && <PathResult
          points={this.state.points}
          polyline={this.state.polyline} />}
      </div>
    )
  }
}

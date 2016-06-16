import React from 'react'

import MapRenderer from './map-renderer'
import CoordinatesList from './coordinates-list'
import RetrievePlot from './retrieve-plot'

/*
[
[1.3521939999999999, 103.9455123000000185],
[1.3051229114645768, 103.8776444624268152],
[1.2988445000000000, 103.7867622999999639]
]
*/

export default class RoutePlotter extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      input: null,
      waypoints: null,
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
      let {origin, destination, waypoints} = directions.request
      waypoints = [origin, ...waypoints.map((point) => point.location), destination]
      this.setState({
        waypoints: waypoints.map((point) => [point.lat(), point.lng()]),
        points: overview_path.map((point) => [point.lat(), point.lng()]),
        polyline: overview_polyline
      })
    }
    this.directionsRenderer = renderer
  }

  updateCoordinates (input) {
    const inputData = JSON.parse(input)
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
        {this.state.waypoints && <RetrievePlot
          {...this.state} />}
      </div>
    )
  }
}

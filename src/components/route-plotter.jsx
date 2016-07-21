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
      query: null,
      result: null
    }
    this.setMap = this.setMap.bind(this)
    this.updateCoordinates = this.updateCoordinates.bind(this)
  }

  setMap (map) {
    this.map = map
  }

  updateCoordinates (input) {
    const inputData = JSON.parse(input)
    const directionsService = new google.maps.DirectionsService()
    const inputLatLng = inputData.map((coordinates) => new google.maps.LatLng(...coordinates))
    this.setState({query: inputData, result: []})

    if (this.directionsRenderers) {
      this.directionsRenderers.forEach(renderer => { renderer.setMap(null) })
    }

    function updateDirections (renderer, origin, destination, waypoints) {
      const request = {
        origin, destination, waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false
      }

      directionsService.route(request, (result, status) => {
        if (status !== google.maps.DirectionsStatus.OK) return
        renderer.setDirections(result)
      })
    }

    this.directionsRenderers = []

    for (let i = 0; i < inputLatLng.length - 1; i++) {
      const renderer = new google.maps.DirectionsRenderer({
        map: this.map,
        draggable: true,
        markerOptions: {icon: 'https://maps.gstatic.com/mapfiles/dd-via.png'},
        polylineOptions: {
          strokeColor: i % 2 ? 'red' : 'blue'
        },
        preserveViewport: true
      })

      let lastOrigin = inputLatLng[i]
      let lastDestination = inputLatLng[i + 1]

      renderer.directions_changed = () => {
        const directions = renderer.getDirections()
        console.log(directions)
        const {origin: currentOrigin, destination: currentDestination} = directions.request
        if (i > 0 && currentOrigin !== lastOrigin.lat()) {
          lastOrigin = currentOrigin
          const directions = this.directionsRenderers[i - 1].getDirections()
          const {origin, waypoints} = directions.request
          updateDirections(this.directionsRenderers[i - 1], origin, currentOrigin, waypoints)
        } else if (i < inputLatLng.length - 1 && currentDestination !== lastDestination) {
          lastDestination = currentDestination
          const directions = this.directionsRenderers[i + 1].getDirections()
          const {destination, waypoints} = directions.request
          updateDirections(this.directionsRenderers[i + 1], currentDestination, destination, waypoints)
        }
        this.state.result[i] = directions.routes[0].overview_path
        this.setState({result: this.state.result})
      }

      updateDirections(renderer, inputLatLng[i], inputLatLng[i + 1])

      this.directionsRenderers.push(renderer)
    }
  }

  render () {
    return (
      <div>
        <MapRenderer
          onMount={this.setMap}/>
        <CoordinatesList
          onUpdate={this.updateCoordinates} />
        {this.state.result && <RetrievePlot
          result={this.state.result} />}
      </div>
    )
  }
}

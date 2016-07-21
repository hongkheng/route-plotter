import React from 'react'

import MapRenderer from './map-renderer'
import CoordinatesList from './coordinates-list'
import RetrievePlot from './retrieve-plot'

/*
[
[1.352194, 103.945512],
[1.305412, 103.889355],
[1.278959, 103.839253],
[1.298845, 103.786762],
[1.341795, 103.735204],
[1.360917, 103.844595],
[1.439465, 103.841945],
[1.451828, 103.791793],
[1.418731, 103.696728]
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
    this.setState({query: inputData})

    this.updateQueue = Promise.resolve()

    let updateDirections = (renderer, origin, destination, waypoints) => {
      const update = () => {
        const request = {
          origin, destination, waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: false,
          avoidTolls: false
        }

        return new Promise((resolve, reject) => {
          directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              renderer.setDirections(result)
              setTimeout(resolve, 300)
            } else {
              console.log(status, result)
              reject()
            }
          })
        })
      }

      this.updateQueue = this.updateQueue.then(update)
    }

    updateDirections = updateDirections.bind(this)

    if (this.directionsRenderers) {
      this.directionsRenderers.forEach(renderer => { renderer.setMap(null) })
    }
    this.directionsRenderers = []
    this.state.result = []

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
        if (i > 0 && currentOrigin !== lastOrigin) {
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

      updateDirections(renderer, lastOrigin, lastDestination)

      this.directionsRenderers.push(renderer)
      this.state.result.push([lastOrigin, lastDestination])
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

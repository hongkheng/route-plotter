import React, {PropTypes} from 'react'

const styleProps = {
  container: {marginTop: '30px'},
  polyline: {overflowWrap: 'break-word'}
}

export default class RetrievePlot extends React.Component {

  static propTypes = {
    result: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object))
  };

  render () {
    let points = this.props.result.reduce((allPoints, somePoints) => (
      allPoints.concat(somePoints)
    ), [])
    const polyline = google.maps.geometry.encoding.encodePath(points)
    points = points.map((point) => [point.lat(), point.lng()])

    return (
      <div className='container' style={styleProps.container}>
        <h2>Retrieve Plot</h2>
        <h3>Polyline</h3>
        <p style={styleProps.polyline}>{polyline}</p>
        <h3>Points</h3>
        {points.map((latLng, i) => (
          <p key={i}>{latLng[0].toFixed(16)}, {latLng[1].toFixed(16)}</p>
        ))}
      </div>
    )
  }
}

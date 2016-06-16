import React, {PropTypes} from 'react'

const styleProps = {
  container: {marginTop: '30px'},
  polyline: {overflowWrap: 'break-word'}
}

export default class CoordinatesList extends React.Component {

  static propTypes = {
    points: PropTypes.array,
    polyline: PropTypes.string
  };

  render () {
    return (
      <div className='container' style={styleProps.container}>
        <h2>Plotter Result</h2>
        <h3>Polyline</h3>
        <p style={styleProps.polyline}>{this.props.polyline}</p>
        <h3>Points</h3>
        {this.props.points.map((latLng, i) => (
          <p key={i}>{latLng[0].toFixed(16)}, {latLng[1].toFixed(16)}</p>
        ))}
      </div>
    )
  }
}

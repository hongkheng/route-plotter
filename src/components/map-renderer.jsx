import React, {PropTypes} from 'react'

const styleProps = {
  title: {
    textAlign: 'center',
    marginTop: '20px'
  },
  map: {
    width: '100%',
    height: '480px',
    marginBottom: '30px'
  }

}

export default class CoordinatesList extends React.Component {

  static propTypes = {
    onMount: PropTypes.func.isRequired
  };

  componentDidMount () {
    const singapore = new google.maps.LatLng(1.352083, 103.819836)
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 11,
      center: singapore
    })
    this.props.onMount(map)
  }

  render () {
    return (
      <div className='container'>
        <h1 style={styleProps.title}>Experimental Route Plotter</h1>
        <div id='map' style={styleProps.map} />
      </div>
    )
  }
}

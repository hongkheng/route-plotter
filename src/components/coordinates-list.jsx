import React, {PropTypes} from 'react'

const styleProps = {
  display: 'block',
  width: '100%',
  margin: '0 auto'
}

export default class CoordinatesList extends React.Component {

  static propTypes = {
    onUpdate: PropTypes.func.isRequired
  };

  render () {
    return (
      <div className='container'>
        <textarea className='form-control'
          ref='input'
          rows={7}
          placeholder='Paste coordinates here'
          style={styleProps} />
        <button className='btn btn-primary'
          style={styleProps}
          onClick={(e) => this.props.onUpdate(this.refs.input.value)}>
          Submit
        </button>
      </div>
    )
  }
}

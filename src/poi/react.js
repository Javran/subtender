import React from 'react'

// eslint-disable-next-line react/prop-types
const Placeholder = ({style}) => (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...style,
  }}>
    <img
      style={{
        maxWidth: 600,
        width: '100%',
        height: '100%',
      }}
      src="https://raw.githubusercontent.com/Javran/subtender/master/decolorized-taigei.png"
      alt="decolorized-taigei"
    />
  </div>
)

export { Placeholder }

import React from 'react'

function Input(props) {
  return (
    <input
        className={props.className}
        placeholder={props.placeholder}
        type={props.type}
        onChange={props.onChange}
        required={props.need}
        value={props.value}
        name={props.name}
        onClick={props.onClick}
        id={props.id}
        accept={props.accept}

    />
  )
}

function Button(props){
    return(
        <button  onClick={props.onClick}
        className={props.className}
        
        >{props.name}</button>
    )
}
export  { Input,Button}
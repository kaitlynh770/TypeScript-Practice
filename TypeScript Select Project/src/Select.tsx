import { useEffect, useState, useRef } from 'react'
import styles from './select.module.css'

export type SelectOption = {
    label: string
    value: string | number
}

type SingleSelectProps = {
    multiple?: false
    value?: SelectOption
    onChange: (value: SelectOption | undefined) => void
}

type MultipleSelectProps = {
    multiple: true
    value: SelectOption[]
    onChange: (value: SelectOption[]) => void
}

type SelectProps = {
    options: SelectOption[]
} & (SingleSelectProps | MultipleSelectProps) //all of the properties are going to have the options from SelectProps then they're either going to include all the SingleSelectProps or the MultipleSelectProps

export function Select({ multiple, value, onChange, options}: SelectProps){
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    function clearOptions(){
        multiple? onChange([]) : onChange(undefined); //if multiple is true then we change to an emtpy array and if multiple isn't true than we change it to undefined
    }
    function selectOption(option: SelectOption){
        if (multiple){
            if(value.includes(option)){
                onChange(value.filter(o=> o !== option))
            } else{
                onChange([...value, option])
            }
        }
        else{
            if (option !== value) onChange(option)
        }
    }

    function isOptionSelected(option: SelectOption){
        return multiple ? value?.includes(option) : option === value
    }

    useEffect(() => {
        if(isOpen) setHighlightedIndex(0)
    }, [isOpen])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target != containerRef.current) return //the event only works on the element itself and not the elements inside of it

            switch (e.code){
                case "Enter":
                case "Space":
                    setIsOpen(prev => prev)
                    if(isOpen) selectOption(options[highlightedIndex])
                    break
                case "ArrowUp":
                case "ArrowDown": { //in these cases, we're creating a new value called newValue and we just wanna make it sure it doesn't leak outside the intended case
                    if (!isOpen){
                        setIsOpen(true)
                        break
                    }
                    const newValue = highlightedIndex + (e.code === "ArrowDown" ? 1 : -1)

                    if(newValue >= 0 && newValue < options.length){
                        setHighlightedIndex(newValue);
                    }
                    break
                }
                case "Escape":
                    setIsOpen(false);
                    break
            }

        }
        containerRef.current?.addEventListener("keydown", handler);

        return () => { //cleanup
            containerRef.current?.removeEventListener("keydown", handler)
        }
    }, [isOpen, highlightedIndex, options])
    return (
        <div 
        ref = {containerRef}
        onClick = {()=> setIsOpen(prev=>!prev)}  //hide or open the drop down based off of its current value
        onBlur = {()=> setIsOpen(false)}  // close the div even when clicking off the select element
        tabIndex={0} 
        className = {styles.container}>
            <span className = {styles.value}>
                {multiple ? value.map(v=> (
                    <button key = {v.value} onClick = {e=> {
                            e.stopPropagation();
                            selectOption(v);
                        }}
                        className = {styles["option-badge"]}
                        >
                        {v.label}
                        <span className = {styles["remove-btn"]}>&times;</span>
                    </button>
                )) : value?.label}
            </span>
            <button onClick = {e=> {
                e.stopPropagation() //stop from event bubbling
                clearOptions()
            }}className = {styles["clear-btn"]}>&times;</button>
            <div className = {styles.divider}></div>
            <div className = {styles.caret}></div>
            <ul className = {`${styles.options} ${isOpen? styles.show: ""}`}>
                {options.map((option, index) => (
                    <li onClick = { e=> {
                        e.stopPropagation();
                        selectOption(option)
                        setIsOpen(false);
                    }}
                    onMouseEnter = {() => setHighlightedIndex(index)}
                    key = {option.label} 
                    className = {`${styles.option}
                     ${isOptionSelected(option) ? styles.selected : ""}
                     ${ index === highlightedIndex? styles.highlighted : ""}
                    `}
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div>
    )
} 
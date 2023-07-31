import React, { useState, useEffect, useCallback } from "react";
import { avatar } from '../../functions/misc';


const Search = ({ id, placeholder, list, isLoading, searched, setSearched }) => {

    const [dropdownVisible, setDropdownVisible] = useState(false)
    const [dropdownOptions, setDropdownOptions] = useState([])



    const getOptions = useCallback((s) => {
        const all_options = list
        const options = all_options.filter(x =>
            x.text?.trim().toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .includes(s.replace(/[^a-z0-9]/g, "").trim().toLowerCase()))
            .sort(
                (a, b) => b.text
                    ?.trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "")
                    .startsWith(
                        s
                            .replace(/[^a-z0-9]/g, "")
                            .trim()
                            .toLowerCase()
                    ) ? 1 : -1
            )


        return options;
    }, [list])


    const handleSearch = (input) => {
        let s = input
        let options;
        let visible;

        if (s === '') {
            options = [];
            visible = false
            setSearched(s)
        } else if (list.map(x => x.text?.trim().toLowerCase()).includes(s.trim().toLowerCase())) {
            const option = list.find(x => x.text?.trim().toLowerCase() === s.trim().toLowerCase())
            options = []
            visible = false
            setSearched(option)
        } else {
            options = getOptions(s)
            visible = true
            setSearched(s)
        }
        setDropdownVisible(visible)
        setDropdownOptions(options)
    }



    return <>
        <div
            onBlur={() => setDropdownVisible(false)}
            className={'search_wrapper'}
        >
            {
                searched?.image ?
                    avatar(searched.image.src, searched.image.alt, searched.image.type)
                    :
                    null
            }
            <input
                className={'search'}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setDropdownVisible(true)}

                id={id === undefined ? null : id}
                placeholder={placeholder}
                type="text"
                value={searched?.text || searched}
                autoComplete={'off'}
                disabled={isLoading}
            />
            {
                searched === '' || !dropdownVisible && (searched !== '' && dropdownVisible) ?
                    <button
                        onClick={() => handleSearch(' ')}
                        className={'input click'}
                    >
                        &#9660;
                    </button>
                    :
                    <button
                        type="reset"
                        onClick={() => handleSearch('')}
                        className={'input click'}
                    >
                        X
                    </button>
            }
            {
                dropdownVisible && dropdownOptions.length > 0 && !isLoading ?
                    <ol
                        onBlur={() => setDropdownVisible(false)}
                        className="dropdown"
                    >
                        {dropdownOptions
                            .map((option, index) =>
                                <li key={`${option.text}_${index}`}>
                                    <button
                                        className="click"
                                        onMouseDown={() => setSearched(option)}
                                    >
                                        {
                                            option.image ?
                                                <p>
                                                    {
                                                        avatar(
                                                            option.image.src, option.image.alt, option.image.type
                                                        )
                                                    }
                                                    {option.text}
                                                </p>
                                                :
                                                option.text
                                        }
                                    </button>
                                </li>
                            )}
                    </ol>
                    :
                    null

            }
        </div>
    </>
}

export default Search;
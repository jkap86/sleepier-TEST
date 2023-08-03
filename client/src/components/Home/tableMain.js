import '../../css/css/tableMain.css';
import { avatar } from '../../functions/misc';
import { useEffect, useRef } from 'react';
import Search from './search';

const TableMain = ({
    id,
    type,
    headers,
    body,
    page,
    setPage,
    itemActive,
    setItemActive,
    caption,
    search,
    searched,
    setSearched,
    options1,
    options2,
    partial,
    loadMore
}) => {
    const pageRef = useRef(null)
    const itemActiveRef = useRef(null)

    useEffect(() => {
        if (pageRef.current !== null) {
            pageRef.current.focus()
            pageRef.current.scrollIntoView({
                behavior: 'smooth',
                inline: 'center'
            })
        }

    }, [pageRef, page])


    useEffect(() => {
        if (itemActiveRef.current !== null) {
            itemActiveRef.current.focus()
            itemActiveRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }

    }, [itemActiveRef, itemActive])


    return <>
        {
            search ?

                <div className='search_filter_wrapper'>
                    <div>
                        {
                            options1?.map(option => option)
                        }
                    </div>
                    <Search
                        id={id}
                        placeholder={`Search ${id}`}
                        list={body
                            ?.filter((b, index) => b.search.text !== 'orphan' || !body.slice(0, index).find(x => x.search.text === 'orphan'))
                            ?.map(b => {
                                return {
                                    ...b.search,
                                    id: b.id
                                }
                            })}
                        searched={searched}
                        setSearched={setSearched}
                    />
                    <div>
                        {
                            options2?.map(option => option)
                        }
                    </div>
                </div>
                :
                null
        }
        {

            page ?
                <div className="page_numbers_wrapper" >
                    <>
                        {
                            (Math.ceil(body?.length / 25) <= 1) ? null :
                                <ol className="page_numbers">
                                    {Array.from(Array(Math.ceil((body?.length / 25) || 0)).keys()).map(page_number =>
                                        <li
                                            className={page === page_number + 1 ? 'active click' : 'click'}
                                            key={page_number + 1}
                                            onClick={() => setPage(page_number + 1)}
                                            ref={page === page_number + 1 ? pageRef : null}
                                        >
                                            {page_number + 1}
                                        </li>
                                    )}
                                    {
                                        partial ?
                                            <li
                                                className='click'
                                                onClick={loadMore}
                                            >
                                                ...
                                            </li>
                                            : null
                                    }
                                </ol>
                        }
                    </>
                </div>
                : null
        }


        <table className={type} id={id} >
            {
                caption ?
                    <caption>
                        {caption}
                    </caption>
                    : null
            }
            <thead>
                {
                    headers?.map((header, index) =>
                        <tr key={index}>
                            {
                                header.filter(x => x).map((key, index) =>
                                    <th
                                        key={index}
                                        colSpan={key?.colSpan}
                                        rowSpan={key?.rowSpan}
                                        className={key?.className}
                                        onClick={key?.onClick}
                                    >
                                        {
                                            key?.text
                                        }
                                    </th>
                                )
                            }
                        </tr>
                    )
                }
            </thead>
            {
                !(page > 1) ? null :
                    <tbody>
                        <tr
                            className={'click'}
                            onClick={() => setPage(page - 1)}
                        >
                            <td colSpan={headers[0].reduce((acc, cur) => acc + (cur.colSpan || 0), 0)}>PREV PAGE</td>
                        </tr>
                    </tbody>

            }
            {
                body?.length > 0 ?
                    <tbody
                    >
                        {
                            body
                                ?.filter(x => x)
                                ?.slice(Math.max(((page || 1) - 1) * 25, 0), (((page || 1) - 1) * 25) + 25)
                                ?.map((item, index) =>

                                    <tr
                                        key={index}
                                        className={`${type} click ${itemActive === item.id ? 'active_wrapper' : ''}`}
                                    >
                                        <td
                                            colSpan={item.list?.reduce((acc, cur) => acc + (cur.colSpan || 0), 0)}
                                        >
                                            <table className={`${type}_body`}>
                                                <tbody>
                                                    <tr
                                                        className={`${type} click ${itemActive === item.id ? 'active' : ''}`}
                                                        ref={(itemActive === item.id && !type.split(' ').includes('lineup')) ? itemActiveRef : null}
                                                        onClick={setItemActive ? () => itemActive === item.id ? setItemActive('') : setItemActive(item.id) : null}
                                                    >
                                                        {
                                                            item.list
                                                                ?.filter(x => x.text)
                                                                ?.map((key, index) =>
                                                                    <td
                                                                        key={index}
                                                                        colSpan={key.colSpan}
                                                                        className={key.className}
                                                                    >
                                                                        {
                                                                            key.image ?
                                                                                <p>
                                                                                    {
                                                                                        avatar(
                                                                                            key.image.src, key.image.alt, key.image.type
                                                                                        )
                                                                                    }
                                                                                    <span>{key.text}</span>
                                                                                </p>
                                                                                :
                                                                                key.text
                                                                        }
                                                                    </td>
                                                                )
                                                        }
                                                    </tr>
                                                </tbody>
                                                <tbody>
                                                    {
                                                        (itemActive !== item.id || !item.secondary_table) ? null :
                                                            <tr className={`${type} click ${itemActive === item.id ? 'active2' : ''}`}>
                                                                <td colSpan={item.list.reduce((acc, cur) => acc + (cur.colSpan || 0), 0)}>
                                                                    {item.secondary_table}
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                )

                        }
                    </tbody>
                    :
                    <tbody>
                        <tr>
                            <td
                                colSpan={headers[0]?.reduce((acc, cur) => acc + (cur?.colSpan || 0), 0)}
                            >
                                NO DATA
                            </td>
                        </tr>
                    </tbody>
            }
            {
                (((page - 1) * 25) + 25) < body?.length || partial ?
                    <tbody>
                        <tr
                            className={'click'}
                            onClick={(((page - 1) * 25) + 25) < body?.length ? () => setPage(page + 1) : loadMore}
                        >
                            <td colSpan={headers[0].reduce((acc, cur) => acc + (cur.colSpan || 0), 0)}>NEXT PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
        </table>
    </>
}

export default TableMain;
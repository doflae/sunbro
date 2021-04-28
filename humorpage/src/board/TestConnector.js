import React, { useEffect, useState, useRef } from 'react';
import {WindowScroller, CellMeasurer, CellMeasurerCache, AutoSizer, List} from 'react-virtualized';

const cache = new CellMeasurerCache({
    defaultWidth: 100,
    fixedWidth: true
});

function TestConnector({...props}) {
    const [boards, setBoards] = useState([]);
    let lastBoard = 0;

    const getBoard = () =>{
        let resturl = `/board/recently?`
        if(lastBoard!==0){
            resturl+=`board_id=${lastBoard}`
        }
        props.request('get',resturl).then(res=>{
            const resData = res.data.list
            setBoards([...boards,...resData])
            lastBoard = resData[resData.length-1]['id']
        })
    }
    const listRef = useRef(null);

    const rowRenderer = ({ index, key, parent, style }) => {
        return (
            <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
                <div style={style}>
                    <Board board={boards[index]}/>
                </div>
            </CellMeasurer>
        );
    };


    useEffect(() => {
        getBoard()
    }, []);

    return (<WindowScroller>
                {({ height, scrollTop, isScrolling, onChildScroll }) => (
                    <AutoSizer disableHeight>
                        {({ width }) => (
                            <List
                                ref={listRef}
                                autoHeight
                                height={height}
                                width={width}
                                isScrolling={isScrolling}
                                overscanRowCount={0}
                                onScroll={onChildScroll}
                                scrollTop={scrollTop}
                                rowCount={posts.length}
                                rowHeight={cache.rowHeight}
                                rowRenderer={rowRenderer}
                                deferredMeasurementCache={cache}
                            />
                        )}
                    </AutoSizer>
                )}
            </WindowScroller>
    );
}

export default TestConnector;
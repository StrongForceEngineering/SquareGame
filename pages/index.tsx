import { use, useEffect, useState } from 'react';
import CSS from 'csstype';

interface StateObject {
  id: string,
  state: number
}

function makeId(length: number): string {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function generateEvenBoard(): number[] {
  const genBoard = () => Array(8 ** 2).fill(0).map(_ => [0, 1][Math.floor(Math.random() * 2)]);

  let board = genBoard();

  const halfBoardSize = board.length / 2;

  const checkWhileCondition = () => {
    const sizeOfOnesInBoard = board.filter(curr => curr === 1).length;

    return (
      sizeOfOnesInBoard > Math.floor(halfBoardSize + halfBoardSize * 0.01) ||
      sizeOfOnesInBoard < Math.floor(halfBoardSize - halfBoardSize * 0.01)
    )
  }

  while (checkWhileCondition()) {
    board = genBoard();
  }

  return board;
}

export default function Game() {
  const [gameState, setGameState] = useState<StateObject[] | null>();
  // Green is 0; Red is 1
  const [redOrGreen, setRedOrGreen] = useState<number | null>();
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(10);

  function initGameState(): void {
    const evenBoardStates = generateEvenBoard();

    const initialState: StateObject[] = Array(8**2).fill(0).map((_, i) => ({
      id: makeId(6),
      state: evenBoardStates[i]
    }));
  
    setGameState(initialState);

    setRedOrGreen(Math.floor(Math.random() * 2));

    setGameTimeLeft(10);
  }

  useEffect(() => {
    initGameState();

    const intervalId: NodeJS.Timer = setInterval(
      () => setGameTimeLeft((last: number) => last - 1), 
      1000
    );

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (gameTimeLeft === 0) {
      alert('you lose!');
      initGameState();
    }
  }, [gameTimeLeft]);

  useEffect(() => {
    if (!gameState) return;

    if ((gameState?.filter(curr => curr.state === Number(redOrGreen)).length) === gameState?.length) {
      alert('you win!');
      initGameState();
    }

    else if ((gameState?.filter(curr => curr.state === Number(!redOrGreen)).length) === gameState?.length) {
      alert('you lose!');
      initGameState();
    }
  }, [gameState])

  return(
    <div className='w-screen h-screen flex flex-col justify-center items-center'>
      <h1>Make them all {redOrGreen ? 'red' : 'green'}!</h1>

      <h2>You have {gameTimeLeft} seconds left!</h2>

      <div className="grid grid-flow-row grid-cols-8 grid-rows-8 w-96 h-96 mt-8">
        {gameState?.map(({id, state}) => {
          return(
            <Square 
              key={id} 
              id={id} 
              cellState={state}
              setGameState={setGameState}
            />
          )
        })}
      </div>
    </div>
  )
}

const Square = ({ id, setGameState, cellState }) => {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    setIsSelected(!cellState ? true : false);
  }, []);

  function detBackgroundColor(): string {
    if (mouseIsOver && cellState) return 'rgb(200, 0, 0)';

    else if (mouseIsOver) return 'rgb(0, 200, 0)';

    else if (cellState) return 'rgb(255, 0, 0)';

    else return ('rgb(0, 255, 0');
  }

  const style: CSS.Properties = {
    backgroundColor: detBackgroundColor()
  }

  function handleClick(): void {    
    setIsSelected(last => !last);

    setGameState((last: StateObject[]): StateObject[] => {
      const currCellIdx: number | null = last.findIndex(element => element.id === id);
      const copy = [...last];
      copy[currCellIdx].state = isSelected ? 1 : 0;

      return copy;
    })
  }

  return(
    <div
      className='w-full h-full border border-black rounded-lg'
      style={style}
      onMouseEnter={(): void => setMouseIsOver(true)}
      onMouseLeave={(): void => setMouseIsOver(false)}
      onClick={handleClick}
    />
  )
}
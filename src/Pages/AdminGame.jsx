import { useAdminGameState } from '../hooks/useAdminGameState';

const AdminGame = () => {
  const { id } = useParams();
  const { 
    gameState, 
    error, 
    players, 
    showOptions, 
    showAnswer, 
    stopGame 
  } = useAdminGameState(id);

  const handleShowOptions = async () => {
    try {
      await showOptions(15); // 15 seconds timer
    } catch (error) {
      console.error('Error showing options:', error);
    }
  };

  const handleShowAnswer = async () => {
    try {
      await showAnswer();
    } catch (error) {
      console.error('Error showing answer:', error);
    }
  };

  const handleStopGame = async () => {
    try {
      await stopGame();
    } catch (error) {
      console.error('Error stopping game:', error);
    }
  };

  // Rest of your component code...
};
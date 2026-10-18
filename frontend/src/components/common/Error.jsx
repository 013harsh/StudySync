import { useNavigate } from "react-router-dom";

const Error = ({ message, onBack, backText = "Go Back", fullScreen = true }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (!fullScreen) {
    return (
      <div className="flex items-start gap-3 alert alert-error rounded-xl">
        <span className="text-xl">❌</span>
        <div>
          <p className="text-base font-bold">Error</p>
          <p className="text-sm opacity-80 mt-0.5">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="max-w-md shadow-xl card bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-error">Error</h2>
          <p>{message}</p>
          <div className="justify-end card-actions">
            <button onClick={handleBack} className="btn btn-primary">
              {backText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;

const Loading = ({ message, fullScreen = true }) => {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? "min-h-screen bg-base-200" : "py-20"}`}>
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        {message && <p className="mt-4 text-base-content/60">{message}</p>}
      </div>
    </div>
  );
};

export default Loading;

import clsx from 'clsx';

const Card = ({ children, className = '', padding = true, ...props }) => {
  return (
    <div 
      className={clsx(
        'bg-white rounded-lg shadow-md',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={clsx('border-b border-gray-200 pb-4 mb-4', className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={clsx('text-xl font-bold text-gray-900', className)}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={clsx(className)}>
      {children}
    </div>
  );
};

export default Card;

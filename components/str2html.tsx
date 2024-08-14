const Str2html: React.FC<{ htmlString: string }> = ({ htmlString }) => {
    return (
      <div className="format-html" dangerouslySetInnerHTML={{ __html: htmlString }} />
    );
  };
  
  export default Str2html;
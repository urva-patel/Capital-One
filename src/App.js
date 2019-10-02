import React, {useState, useCallback}  from 'react';
import robot from './images/robot.svg';
import './App.css';

import Reader from './reader/reader'
import getRules from './rules'


const App = () => {
  const fileInput = React.createRef();
  const [rules, setRules] = useState(null);
  const [numLines, setNumLines] = useState(0);
  const [fileName, setFileName] = useState(null);
  const [fileExists, setFileExists] = useState(null);
  const [contentString, setContentString] = useState([])

  const lineCount = t => {
    var nLines = 0;
    for( var i = 0, n = t.length;  i < n;  ++i ) {
        if( t.charAt(i) === '\n' ) {
            ++nLines;
        }
    }
    return nLines+1;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const file = fileInput.current.files[0];
    if(file !== undefined){
      setFileExists(true)
      const fileType = file.name.split('.')[1];
      const ruleResult = getRules(fileType);
      setRules(ruleResult);
      const reader = new FileReader();
      reader.onload = function(){
        const text = reader.result;
        setNumLines(lineCount(text));
        const content = text.replace(/\n/g,'\\\\n')
        setContentString(content)
      };
      reader.readAsText(file);
    }
    else {
      setFileExists(false)
    }
    
  }

  const sendData = useCallback( () => {
    return (
        (rules !== null && numLines !== 0) && 
        <Reader fileContent={contentString} rules={rules} numLines={numLines}/>
    )
  }, [contentString, rules, numLines])

  const shareSpace = useCallback(() => {
    return (rules !== null && numLines !== 0) ? "less" : "full"
  }, [ rules, numLines])

  const showResults = useCallback(() => {
    return (rules !== null && numLines !== 0) ? "more" : "none"
  }, [ rules, numLines])

  const fileText = useCallback(() => {
    return fileName !== null ? fileName : "Select A File"
  }, [fileName])

  const errorMessage = useCallback(() => {
    return fileExists === false && "please upload a file"
  }, [fileExists])

  const changeName = (event) => {
    event.preventDefault()
    const name = event.target.value
    const split = name.split("\\")[2];
    setFileName(split);
  }


  return (
      <div className="layout">
      <header className="top">
        <div id="title">
          Comment Reader Bot
        </div>

        <form id="submitForm" onSubmit={handleSubmit}>
          <label htmlFor="fileInput" className='submitButton'>
            Upload
            <input id='fileInput' type="file" ref={fileInput} onChange={changeName}/>
          </label>
          <div id="fileName">{fileText()}</div>
          <button className="submitButton" type="submit" >Submit</button>
        </form>
        <div id="error">{errorMessage()}</div>
      </header>
      <div className='bottom'>
        <div id="robotDiv" className={shareSpace()}>
          <div id="robotText">Hey there! To Upload your file select 'Upload' and then select 'Submit' to count the number of comments in it! Supported files are .java, .py, .js, .c, and .cpp</div>
          <div id="robotImgDiv"><img id="robotImg" src={robot} alt="robotImg"/></div>
        </div>
        <div id="dataComponent" className={showResults()}>{sendData()}</div>
      </div>
    </div>
  );
}

export default App;

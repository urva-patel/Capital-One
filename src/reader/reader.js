import React, {useState, useEffect}  from 'react';

import './reader.css'

const Reader = (props) => {
  const fileContent = props.fileContent;
  const numLines = props.numLines;
  const rules = props.rules;
  const [numComments, setNumComments] = useState(0)
  const [numBlockLine, setNumBlockLine] = useState(0)
  const [numSingleline, setNumSingleline] = useState(0)
  const [numBlocks, setNumBlocks] = useState(0)
  const [numTodo, setNumTodo] = useState(0)

  const findToDo = (content) => {
    const todoLocations = [];
    var i = 0;
    while (i < content.length) {
        i = content.indexOf("TODO:", i);
        if (i === -1)
            break;
        todoLocations.push(i);
        i++;
    }
    return todoLocations;
}

const isTodoInComment = (todoLocations, start, end) => {
  for (var ti = 0; ti < todoLocations.length; ti++) {
      //check if toDo is between start and end
      if (start < todoLocations[ti] && todoLocations[ti] < end)
          return true;
  }
  return false;
}

  useEffect(() => {
    const todoLocations = findToDo(fileContent);
    const newLineKey = "\\\\n";
    var i = 0;
    var foundQuote = false, foundComment = false, 
      inBlockComment = false, prevLineIsComment = false, foundNewLine = false;
    var targetQuote = "";

    //offset is how many chars to skip
    const newLineOffset = newLineKey.length;
    var quoteOffset = -1;
    const commentOffset = rules.comment.length;
    const startBlockOffset =  rules.beginBlock.length;

    //react hooks will update after useEffect, so we keep variables local to the function
    var comments = 0;
    var blocks = 0;
    var single = 0;
    var todo = 0;
    var blockLines = 0;

    // Windows are the strings obtained by looking forward by an offset
    var blockStartWindow = null, commentBlock = null, quoteWindow = null, newLineWindow = null;

    while (i < fileContent.length) {
      commentBlock = commentOffset + i < fileContent.length ? fileContent.substring(i, commentOffset + i) : "";
      foundComment = commentBlock.includes(rules.comment);

      for (var j = 0; j < rules.quotes.length; j++) {
        quoteOffset = rules.quotes[j].length;
        quoteWindow = quoteOffset + i < fileContent.length ? fileContent.substring(i, quoteOffset + i) : "";
        foundQuote = quoteWindow.includes(rules.quotes[j]);
        targetQuote = rules.quotes[j];
        if (foundQuote)
          break;
      }

      if (foundQuote){
        var num = i + 1;
        //go to end of quote
        i = fileContent.indexOf(targetQuote, num);
      }

      if (rules.hasBlock) {
        blockStartWindow = (startBlockOffset + i < fileContent.length
                ? fileContent.substring(i, startBlockOffset + i)
                : "")
        inBlockComment = blockStartWindow.includes(rules.beginBlock);

        if (foundComment) {
            const start = i;
            i = fileContent.indexOf(newLineKey, i); // jump to end of line
            comments = comments + 1;
            single = single + 1;
            if (isTodoInComment(todoLocations, start, i))
            todo = todo + 1;
        }

        if (inBlockComment) {
            const blockEndIndex = fileContent.indexOf(rules.closeBlock, i);
            if (isTodoInComment(todoLocations, i, blockEndIndex))
            todo = todo + 1;
        }

        while (inBlockComment) {
            i++;
            const newLineIndex = fileContent.indexOf(newLineKey, i);
            const blockEndIndex = fileContent.indexOf(rules.closeBlock, i);
            if (newLineIndex < blockEndIndex) {
                blockLines = blockLines + 1;
                comments = comments + 1;
                i = newLineIndex;
            } else {
                blocks = blocks + 1;
                comments = comments + 1;
                blockLines = blockLines + 1;
                i = blockEndIndex;
                inBlockComment = false;
            }
        }
      }
      else {

        newLineWindow = newLineOffset + i < fileContent.length ? fileContent.substring(i, newLineOffset + i) : "";
        foundNewLine = newLineWindow.includes(newLineKey);

        if (foundNewLine || i === fileContent.length - 1) {
            // many possibilities after a new line. Could be a standard line of code
            // or if the iterator is in a block, it will end the block
            if (inBlockComment) {
                inBlockComment = false;
                single = single - 1;
                blocks = blocks + 1;
                blockLines = blockLines + 1;
            }
            // or previous line is not comment if whole line not found after line of code 
            if (prevLineIsComment) {
                prevLineIsComment = false;
            }

        }

        if (foundComment) {
            // found a comment
            // if previous line is a comment, then we have a block
            if (prevLineIsComment) {
                inBlockComment = true;
                blockLines = blockLines + 1;
            }
            // previous line is not a comment and we are not in a block, then it
            // is a single line of code
            if (!inBlockComment && !prevLineIsComment) {
                single = single + 1;
            }

            // go to end of line
            const start = i;
            i = fileContent.indexOf(newLineKey, i);
            comments = comments + 1;
            prevLineIsComment = true;
            if (isTodoInComment(todoLocations, start, i))
              todo = todo + 1;
        }

      }
      if (i === -1)
        break;
      i++;
    }
    setNumComments(comments);
    setNumBlocks(blocks);
    setNumSingleline(single);
    setNumTodo(todo);
    setNumBlockLine(blockLines)
  }, [fileContent, rules]);


  return (
    <div id='resultComponent'>
      <div className='threeResults'>
        <div className='totalText'>Total Lines: 
          <div className='result'>{numLines}</div>
        </div>
        <div className='totalText'>Total Comments: 
          <div className='result'>{numComments}</div>
        </div>
        <div className='totalText'>Total Single Comments: 
          <div className='result'>{numSingleline}</div>
        </div>
      </div>
      <div className='threeResults'>
        <div className='totalText'>Total Comment Lines Within Block Comments:
          <div className='result'>{numBlockLine}</div>
        </div>
        <div className='totalText'>Total Comment Blocks: 
          <div className='result'>{numBlocks}</div>
        </div>
        <div className='totalText'>Total ToDo's: 
          <div className='result'>{numTodo}</div>
        </div>
      </div>

    </div>
  );
}

export default Reader;

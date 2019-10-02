const getRules = fileType => {
    switch(fileType) {
        case 'js':
            return (
                {
                    hasBlock : true,
                    comment : "//",
                    beginBlock : "/*",
                    closeBlock : "*/",
                    quotes : [ "\"", "'", "`"]
                }
            )
        case 'py':
            return (
                {
                    hasBlock : false,
                    comment : "#",
                    beginBlock : "",
                    closeBlock : "",
                    quotes : [ "\"", "'", "'''"]
                }
            )
        case ".java":
        case ".c":
        case ".cpp":
        default:
            return (
                {
                    hasBlock : true,
                    comment : "//",
                    beginBlock : "/*",
                    closeBlock : "*/",
                    quotes : [ "\""]
                }
            )
    }
}

export default getRules
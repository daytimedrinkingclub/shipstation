    // Parse the AI response
    const result = this.parseAIResponse(currentMessage.content);
    
    // Handle any tool usage if needed
    await this.handleToolUse(currentMessage, messages);
    
    return result.modifications; 
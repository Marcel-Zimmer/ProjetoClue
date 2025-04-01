

class CircularLinkedList{
    constructor(numberMaxOfPlayers){
        this.head = null
        this.node = null
        this.size = 0
        this.numberMaxOfPlayers = numberMaxOfPlayers
    }

    createNode(value){
        var node = {};
        node.value = value;
        node.next = null;
        return node;
    }

    append(value) {
        if (this.size >= this.numberMaxOfPlayers) {
            console.log("Máximo de jogadores atingido!");
            return;
        }
        const node = this.createNode(value);
    
        if (this.head === null) {
            this.node = node;
            this.node.next = null;
            this.head = this.node;
        }else {
            var ptr = this.node;
            while (ptr.next != null) {
                ptr = ptr.next;
            }
            ptr.next = node;
        }
    
        this.size++;
    }

    toArray() {
        if (!this.head) return [];
    
        let result = [];
        let current = this.head;
        do {
            result.push(current.value);
            current = current.next;
        } while (current !== this.head);
    
        return result;
    }

    findNode(value) {
        if (!this.head) return null; 
        
        let current = this.head;
        do {
            if (current.value === value) {
                this.node = current; 
                return true; 
            }
            current = current.next;
        } while (current !== this.head);
    
        return false; 
    }

    getNextId(){
        this.node = this.node.next ? this.node.next: this.head
        return this.node.value 
    }
}

module.exports = CircularLinkedList;
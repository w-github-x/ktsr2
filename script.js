class ImageGame {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.correctAnswers = 0;
        this.totalAttempts = 0;
        this.hintCount = 0;
        this.currentHintIndex = 0;
        this.isRandom = false;
        this.autoNext = false;
        
        this.initializeElements();
        this.addEventListeners();
    }

    initializeElements() {
        // 获取DOM元素
        this.folderInput = document.getElementById('folderInput');
        this.uploadSection = document.getElementById('uploadSection');
        this.gameSection = document.getElementById('gameSection');
        this.currentImage = document.getElementById('currentImage');
        this.answerInput = document.getElementById('answer');
        this.submitButton = document.getElementById('submit');
        this.hintButton = document.getElementById('hint');
        this.nextButton = document.getElementById('next');
        this.hintText = document.getElementById('hintText');
        this.resultDiv = document.getElementById('result');
        this.accuracySpan = document.getElementById('accuracy');
        this.totalQuestionsSpan = document.getElementById('totalQuestions');
        this.correctAnswersSpan = document.getElementById('correctAnswers');
        this.hintCountSpan = document.getElementById('hintCount');
        this.autoNextCheckbox = document.getElementById('autoNext');
        
        // 获取模式选择按钮
        this.modeInputs = document.querySelectorAll('input[name="mode"]');
    }

    addEventListeners() {
        this.folderInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.submitButton.addEventListener('click', () => this.checkAnswer());
        this.hintButton.addEventListener('click', () => this.showHint());
        this.nextButton.addEventListener('click', () => this.nextImage());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        
        // 模式切换监听
        this.modeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.isRandom = e.target.value === 'random';
                this.resetGame();
            });
        });

        // 自动下一题监听
        this.autoNextCheckbox.addEventListener('change', (e) => {
            this.autoNext = e.target.checked;
        });
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files).filter(file => 
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            alert('请选择包含图片的文件夹！');
            return;
        }

        this.images = files.map(file => ({
            file: file,
            name: file.name.split('.')[0],
            url: URL.createObjectURL(file)
        }));

        this.uploadSection.style.display = 'none';
        this.gameSection.style.display = 'block';
        this.resetGame();
    }

    resetGame() {
        this.currentIndex = 0;
        this.correctAnswers = 0;
        this.totalAttempts = 0;
        this.hintCount = 0;
        this.updateStats();
        this.showCurrentImage();
    }

    showCurrentImage() {
        if (this.images.length === 0) return;

        const index = this.currentIndex;
        this.currentImage.src = this.images[index].url;
        this.answerInput.value = '';
        this.hintText.textContent = '';
        this.resultDiv.textContent = '';
        this.currentHintIndex = 0;
    }

    checkAnswer() {
        const userAnswer = this.answerInput.value.trim().toLowerCase();
        const correctAnswer = this.getCurrentImageName().toLowerCase();

        this.totalAttempts++;
        
        if (userAnswer === correctAnswer) {
            this.correctAnswers++;
            this.resultDiv.textContent = '回答正确！';
            this.resultDiv.className = 'result correct';
            
            if (this.autoNext) {
                setTimeout(() => this.nextImage(), 1000);
            }
        } else {
            this.resultDiv.textContent = '回答错误，请重试！';
            this.resultDiv.className = 'result incorrect';
        }

        this.updateStats();
    }

    getCurrentImageName() {
        const index = this.currentIndex;
        return this.images[index].name;
    }

    showHint() {
        const name = this.getCurrentImageName();
        if (this.currentHintIndex >= name.length) return;

        this.hintCount++;
        let hint = '';
        for (let i = 0; i < name.length; i++) {
            if (i <= this.currentHintIndex) {
                hint += name[i];
            } else {
                hint += '*';
            }
        }
        this.currentHintIndex++;
        this.hintText.textContent = hint;
        this.updateStats();
    }

    nextImage() {
        if (this.images.length === 0) return;

        if (this.isRandom) {
            const currentIndex = Math.floor(Math.random() * this.images.length);
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.images.length);
            } while (newIndex === currentIndex && this.images.length > 1);
            this.currentIndex = newIndex;
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
        }

        this.currentHintIndex = 0;
        this.showCurrentImage();
    }

    updateStats() {
        const accuracy = this.totalAttempts === 0 ? 0 : 
            (this.correctAnswers / this.totalAttempts * 100);
        
        // 计算加权准确率，考虑提示次数的影响
        const weightedAccuracy = this.totalAttempts === 0 ? 0 : 
            (this.correctAnswers / (this.totalAttempts + this.hintCount * 0.5) * 100);

        this.accuracySpan.textContent = `${weightedAccuracy.toFixed(1)}%`;
        this.totalQuestionsSpan.textContent = this.totalAttempts;
        this.correctAnswersSpan.textContent = this.correctAnswers;
        this.hintCountSpan.textContent = this.hintCount;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new ImageGame();
});

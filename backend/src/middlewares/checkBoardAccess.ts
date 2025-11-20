import { Request, Response, NextFunction } from "express";

export const checkBoardOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const board = await prisma.board.findUnique({
            where: { id: parseInt(req.params.boardId) }
        });

        if (!board) return res.status(404).json({ message: 'Board not found' });

        if (board.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

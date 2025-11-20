import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkBoardOwnership } from '../middlewares/checkBoardAccess';
const prisma = new PrismaClient();


const router = Router();

// POST /api/boards/:boardId/invite
router.post('/:boardId/invite', checkBoardOwnership, async (req, res) => {
    const { email, role } = req.body;
    const { boardId } = req.params;

    if (!email) {
        return res.status(400).json({ message: 'Email là bắt buộc' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
    }

    // Check đã mời chưa
    const existing = await prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId, userId: user.id } },
    });
    if (existing) {
        return res.status(409).json({ message: 'Người này đã ở trong board' });
    }

    const newMember = await prisma.boardMember.create({
        data: {
            boardId,
            userId: user.id,
            role: role || 'member',
        },
    });

    res.status(201).json({ message: 'Mời thành công', newMember });
});

export default router;

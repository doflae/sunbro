package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private FileDeleteService fileDeleteService;

    @Autowired
    private RedisRankingService redisRankingService;

    /**
     * 댓글 업로드
     * 게시글 댓글 수 증가
     * 부모 댓글 자식 수 증가
     * 트랜잭션
     * @throws DataIntegrityViolationException 삭제된 댓글에 대해 대댓글 삽입시 발생
     * 롤백에서 제외
     */
    @Transactional(isolation = Isolation.READ_COMMITTED,noRollbackFor = {DataIntegrityViolationException.class})
    public void save(Comment comment) throws DataIntegrityViolationException {
        //대댓글 입력 및 수정 시 이미 삭제된 댓글의 대댓글이라면 Exception 발생
        commentRepository.save(comment);
        //댓글 삽입 먼저 실행 -> 삽입 시 오류 -> 처리
        //if, 카운트 수정 먼저 실행 -> 오류 발생 x -> 삽입 시 오류 -> 롤백 처리
        if(comment.getId()==null){
            jdbcTemplate.update("UPDATE board set comments_cnt=comments_cnt+1 where id=?",comment.getBoardId());
            if(comment.getParentId()!=null){
                jdbcTemplate.update("UPDATE comment set children_cnt=children_cnt+1 where id=?",comment.getParentId());
            }else{
                redisRankingService.addComment(comment.getBoardId(),comment.getId());
            }
        }
    }

    //TODO: 미디어 컬럼 파싱 후 삭제
    //TODO: 대댓글 미디어 경로 부모 댓글에 종속
    public void delete(Comment comment){
        fileDeleteService.deleteFiles(comment.getMedia(),MediaType.COMMENT);
        commentRepository.delete(comment);
        if(comment.getParentId()!=null){
            jdbcTemplate.update("UPDATE comment set children_cnt=children_cnt-1 where id=?",comment.getBoardId());
            jdbcTemplate.update("UPDATE board set comments_cnt=comments_cnt-1 where id=?",comment.getBoardId());
        }else{
            redisRankingService.deleteComment(comment.getBoardId(),comment.getId());
            jdbcTemplate.update("UPDATE board set comments_cnt=comments_cnt-? where id=?",
                    comment.getChildrenCnt()+1,comment.getBoardId());
        }
    }
}

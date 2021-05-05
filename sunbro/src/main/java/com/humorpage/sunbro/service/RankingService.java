package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.BoardDetail;

import java.util.List;

public interface RankingService {
    String RANKING_GETTING_KEY = "ranking:get";

    List<BoardDetail> getRanking(RankingType type);
}

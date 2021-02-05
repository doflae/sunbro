package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Board;

import java.util.List;

public interface RankingService {
    String RANKING_GETTING_KEY = "ranking:get";

    List<Board> getRanking(RankingType type);
}
